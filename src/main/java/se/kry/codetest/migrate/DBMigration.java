package se.kry.codetest.migrate;

import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import se.kry.codetest.DBConnector;

import java.time.LocalDateTime;
import java.util.Arrays;

public class DBMigration {
  private static Vertx VERTX;
  private static DBConnector CONNECTOR;
  public static void main(String[] args) {
    VERTX = Vertx.vertx();
    CONNECTOR = new DBConnector(VERTX);
    // DB Operations - comment out below to perform db operations
//    createTable();
//    addMockData();
//    dropTable();
  }

  /**
   * Helper function to create table
   */
  private static void createTable(){
    CONNECTOR.query("CREATE TABLE IF NOT EXISTS service (url VARCHAR(128) NOT NULL, time VARCHAR(128))").setHandler(done -> {
      if(done.succeeded()){
        System.out.println("Table created!");
      } else {
        done.cause().printStackTrace();
      }
      VERTX.close(shutdown -> {
        System.exit(0);
      });
    });
  }

  /**
   * Helper function to add mock data
   */
  private static void addMockData() {
    CONNECTOR.query("INSERT INTO service (url, time) VALUES ('" + "https://www.kry.se', '" + LocalDateTime.now().toString() + "')").setHandler(done -> {
      if(done.succeeded()){
        System.out.println("Mock data added!");
      } else {
        done.cause().printStackTrace();
      }
      VERTX.close(shutdown -> {
        System.exit(0);
      });
    });
  }

  /**
   * Helper function to drop table
   */
  private static void dropTable(){
    CONNECTOR.query("DROP TABLE service").setHandler(done -> {
      if(done.succeeded()){
        System.out.println("Table deleted!");
      } else {
        done.cause().printStackTrace();
      }
      VERTX.close(shutdown -> {
        System.exit(0);
      });
    });
  }
}
