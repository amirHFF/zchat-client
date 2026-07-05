export class OpenfireClient {
    
    static async fetchUserName(username: string): Promise<string | null> {

        try {
            const response = await fetch(
                `http://130.185.121.173:9090/plugins/restapi/v1/users/${username}`,
                {
                    method: "GET",
                    headers: {
                        "Accept": "application/json"
                    }
                }
            );

            if (response.ok) {
                console.log("User exists");
              
                return username;
            } else if (response.status === 404) {
                console.log("User not found");
                return null;
            } else {
                console.error(`Unexpected status: ${response.status}`);
                return null;
            }
        } catch (error) {
            console.error("Error fetching user:", error);
            return null;
        }
    }
}