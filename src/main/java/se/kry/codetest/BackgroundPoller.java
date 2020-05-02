package se.kry.codetest;

import io.vertx.core.Future;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.client.WebClient;

import java.net.URL;
import java.util.List;
import java.util.Map;

public class BackgroundPoller {
  private static final String FAIL_STATUS = "FAIL";
  private static final String SUCCESS_STATUS = "OK";
  private static final int SUCCESS_STATUS_CODE = 200;

  public Future<List<String>> pollServices(Map<String, String> services, Vertx vertx) {
    WebClient webClient = WebClient.create(vertx);
    services.forEach((serviceUrl, jsonString) -> {
      JsonObject serviceJsonObject = new JsonObject(jsonString);
      if (isUriValid(serviceUrl)) {
        webClient.getAbs(serviceUrl).send(result -> {
          if (result == null || result.result() == null || result.result().statusCode() != SUCCESS_STATUS_CODE) {
            serviceJsonObject.put("status", FAIL_STATUS);
          } else if (result.result().statusCode() == SUCCESS_STATUS_CODE) {
            serviceJsonObject.put("status", SUCCESS_STATUS);
          }
          System.out.println("Polled: " + serviceUrl + " with status: " + serviceJsonObject.getString("status"));
          services.put(serviceUrl, serviceJsonObject.toString());
        });
      } else {
        // when invalid url have the status to fail
        serviceJsonObject.put("status", FAIL_STATUS);
        services.put(serviceUrl, serviceJsonObject.toString());
      }
    });
    return Future.succeededFuture();
  }

  private Boolean isUriValid(String uri){
    try {
      new URL(uri).toURI();
      return true;
    } catch (Exception e){
      System.out.println("Invalid URL: " + uri);
      return false;
    }
  }
}
