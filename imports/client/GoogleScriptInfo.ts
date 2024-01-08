import { Mongo } from "meteor/mongo";

// Pseudo-collection used for image insert info
const GoogleScriptInfo = new Mongo.Collection<{
  configured: boolean;

  /* only exposed to admins */
  outOfDate?: boolean;
}>("googleScriptInfo");

export default GoogleScriptInfo;
