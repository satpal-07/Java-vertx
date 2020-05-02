package se.kry.codetest;

import io.vertx.core.AbstractVerticle;
import io.vertx.core.Future;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.handler.BodyHandler;
import io.vertx.ext.web.handler.StaticHandler;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;

public class MainVerticle extends AbstractVerticle {

  private HashMap<String, String> services = new HashMap<>();
  private DBConnector connector;
  private BackgroundPoller poller = new BackgroundPoller();
  private static final String INITIAL_STATUS = "PENDING";
  private static final int POOLING_TIMER_MS = 20000;

  @Override
  public void start(Future<Void> startFuture) {
      connector = new DBConnector(vertx);
      Router router = Router.router(vertx);
      router.route().handler(BodyHandler.create());
      connector.query("SELECT * FROM service").setHandler(result -> {
        if(result.succeeded()){
          System.out.println("data we have ------" + result.result().toJson());
          for (JsonObject row : result.result().getRows()) {
            services.put(row.getValue("url").toString(), createNewServiceJsonString(row.getValue("time").toString()));
          }
        } else {
          result.cause().printStackTrace();
        }
      });
      vertx.setPeriodic(POOLING_TIMER_MS, timerId -> poller.pollServices(services, vertx));
      setRoutes(router);
      vertx.createHttpServer()
          .requestHandler(router)
          .listen(8080, result -> {
            if (result.succeeded()) {
              System.out.println("KRY code test service started");
              startFuture.complete();
            } else {
              startFuture.fail(result.cause());
            }
          });
  }

  private void setRoutes(Router router){
    router.route("/*").handler(StaticHandler.create());
    router.get("/listService").handler(req -> {
       JsonObject jsonResponse = new JsonObject();
       jsonResponse.put("reloadTimer", POOLING_TIMER_MS);
      List<JsonObject> jsonServices = services
          .entrySet()
          .stream()
          .map(service ->
              new JsonObject(service.getValue())
                  .put("name", service.getKey()))
          .collect(Collectors.toList());
      jsonResponse.put("listService", new JsonArray(jsonServices));
      req.response()
          .putHeader("content-type", "application/json")
          .end(jsonResponse.encode());
    });

    /**
     * Add Service route
     */
    router.post("/addService").handler(req -> {
      JsonObject jsonBody = req.getBodyAsJson();
      String timeStamp = LocalDateTime.now().toString();
      connector.query("INSERT INTO service (url, time) VALUES ('"+  jsonBody.getString("url")  + "', '" + timeStamp + "')").setHandler(done -> {
        if(done.succeeded()){
          System.out.println("Service saved to the Database!");
        } else {
          done.cause().printStackTrace();
        }
      });
      services.put(jsonBody.getString("url"), createNewServiceJsonString(timeStamp));
      req.response()
          .putHeader("content-type", "text/plain")
          .end("OK");
    });

    /**
     * Delete Service route
     */
    router.post("/deleteService").handler(req -> {
      JsonObject jsonBody = req.getBodyAsJson();
      connector.query("DELETE FROM service WHERE url='"+  jsonBody.getString("url")  + "'").setHandler(done -> {
        if(done.succeeded()){
          System.out.println("Service deleted from the Database!");
        } else {
          done.cause().printStackTrace();
        }
      });
      services.remove(jsonBody.getString("url"));
      req.response()
              .putHeader("content-type", "text/plain")
              .end("OK");
    });
  }

  private String createNewServiceJsonString(String time) {
    JsonObject jsonObject = new JsonObject();
    jsonObject.put("time", time);
    jsonObject.put("status", INITIAL_STATUS);
    return jsonObject.toString();
  }

}



