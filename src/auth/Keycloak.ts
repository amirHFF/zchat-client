import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
    url: "http://130.185.121.173:8081",
    realm: "project-z",
    clientId: "z-chat",
});

export default keycloak;