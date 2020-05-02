package se.kry.codetest;

import io.vertx.core.Vertx;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.client.WebClient;
import io.vertx.junit5.Timeout;
import io.vertx.junit5.VertxExtension;
import io.vertx.junit5.VertxTestContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertEquals;

@ExtendWith(VertxExtension.class)
public class TestMainVerticle {

    @BeforeEach
    void deploy_verticle(Vertx vertx, VertxTestContext testContext) {
        vertx.deployVerticle(new MainVerticle(), testContext.succeeding(id -> testContext.completeNow()));
    }

    @Test
    @DisplayName("Start a web server on localhost responding to path /listService on port 8080")
    @Timeout(value = 10, timeUnit = TimeUnit.SECONDS)
    void start_http_server(Vertx vertx, VertxTestContext testContext) {
    WebClient.create(vertx)
        .get(8080, "::1", "/listService")
        .send(response -> testContext.verify(() -> {
          assertEquals(200, response.result().statusCode());
          JsonObject body = response.result().bodyAsJsonObject();
          assertEquals(2, body.size());
          testContext.completeNow();
        }));
    }

    @Test
    @DisplayName("Start a web server on localhost responding to path /addService on port 8080")
    @Timeout(value = 10, timeUnit = TimeUnit.SECONDS)
    void start_http_server_add_service(Vertx vertx, VertxTestContext testContext) {
        WebClient.create(vertx)
                .post(8080, "::1", "/addService")
                .sendJsonObject( new JsonObject().put("url", "http://www.google.com"), response -> testContext.verify(() -> {
                    assertEquals(200, response.result().statusCode());
                    testContext.completeNow();
                }));
    }

    @Test
    @DisplayName("Start a web server on localhost responding to path /deleteService on port 8080")
    @Timeout(value = 10, timeUnit = TimeUnit.SECONDS)
    void start_http_server_delete_service(Vertx vertx, VertxTestContext testContext) {
        WebClient.create(vertx)
            .delete(8080, "::1", "/deleteService")
            .sendJsonObject( new JsonObject().put("url", "http://www.google.com"), response -> testContext.verify(() -> {
                assertEquals(200, response.result().statusCode());
                testContext.completeNow();
            }));
    }

}
