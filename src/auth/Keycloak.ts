import Keycloak from "keycloak-js";
const keycloakServerUrl = import.meta.env.VITE_API_KEYCLOAK_URL;
const keycloakClientId = import.meta.env.VITE_API_CLIENT_ID;
const keycloakRealmName = import.meta.env.VITE_API_REALM_NAME;

const keycloak = new Keycloak({
    url: keycloakServerUrl,
    realm: keycloakRealmName,
    clientId: keycloakClientId,
});

export default keycloak;