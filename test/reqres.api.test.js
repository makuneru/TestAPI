const axios = require("axios");
const { expect } = require("chai");

const baseURL = "https://reqres.in";

describe("Basic Endpoint Tests", async () => {
    describe('List of users test', async () => {
        it("GET list of users by page", async () => {
            await axios.all([
                await axios.get(baseURL + "/api/users"), //default page 1
                await axios.get(baseURL + "/api/users", { params: { page: 2 } }), //get page users from page 2
            ])
                .then(async (res) => {
                    for await (const response of res) {
                        expect(response.status).to.equal(200);
                        expect(response.data.per_page).to.equal(6); //6 users per page
                        expect(response.data.total).to.equal(12); // total number of users
                        expect(response.data.data.length).to.equal(6); //6 users per page
                    }
                    await expect(res[0].data.page).to.equal(1);
                    await expect(res[1].data.page).to.equal(2);
            });
        });

        it("GET search user by first name", async () => {
            //get single user by name
            const firstName = "Lindsay";
            await axios.get(baseURL + "/api/users" , { params: { page: 2 } })
                .then(async (res) => {
                    const userToSearch = Object.fromEntries(Object.entries(res).filter(([key, value]) => res.data.data.first_name === firstName) )
                    await expect(userToSearch.first_name, "Lindsay");
                    await expect(userToSearch.last_name, "Ferguson");
                });
        });

        it("GET single user", async () => {
            //get single user
            await axios.get(baseURL + "/api/users/2")
                .then(async (res) => {
                    await expect(res.status).to.equal(200); //status check
                    await expect(res.data.data.id).to.equal(2); //verify id
                    //verify user details
                    await expect(res.data.data.email).to.equal("janet.weaver@reqres.in");
                    await expect(res.data.data.first_name).to.equal("Janet");
                    await expect(res.data.data.last_name).to.equal("Weaver");
                });
        });

        it("GET single user not found ", async () => {
            //User not found
            await axios.get(baseURL + "/api/users/99").catch(async (err) => {
                await expect(err.response.status).to.equal(404); //status check
                await expect(err.response.statusText).to.equal("Not Found"); //status check
            });
        });
    });

    describe('CRUD Users test', async () => {
        it("POST create new user", async () => {
            await axios.post(baseURL + "/api/users", {
                name: "morpheus",
                job: "test lead",
            })
                .then(async (res) => {
                    await expect(res.status).to.equal(201); //status check
                    //Verify created user details
                    await expect(res.data.name).to.equal("morpheus");
                    await expect(res.data.job).to.equal("test lead");
                });
        });

        it("PUT Update created user", async () => {
            await axios.put(baseURL + "/api/users", {
                name: "morpheus",
                job: "Test engineer",
            })
                .then(async (res) => {
                    await expect(res.status).to.equal(200);
                    //Verify updated user details
                    await expect(res.data.name).to.equal("morpheus");
                    await expect(res.data.job).to.equal("Test engineer");
                });
        });

        it("PATCH Update created user", async () => {
            await axios.patch(baseURL + "/api/users", {
                name: "morpheus",
                job: "QA engineer",
            })
                .then(async (res) => {
                    await expect(res.status).to.equal(200);
                    await expect(res.data.name).to.equal("morpheus");
                    await expect(res.data.job).to.equal("QA engineer");
                });
        });

        it("DELETE request", async () => {
            await axios.delete(baseURL + "/api/users/2").then(async (res) => {
                await expect(res.status).to.equal(204);
            });
        });
    });

    describe('User Registration Test', () => {
        it("POST Registration Successful", async () => {
            await axios.post(baseURL + "/api/register", {
                email: "eve.holt@reqres.in",
                password: "pistol",
            })
                .then(async (res) => {
                    await expect(res.status).to.equal(200); //status check
                    //verify that user is created with new id and token
                    await expect(res.data.id).to.be.exist;
                    await expect(res.data.token).to.be.exist;
                });
        });

        it("POST Registration unsuccessful", async () => {
            await axios.post(baseURL + "/api/register", {
                email: "sydney@fife",
            })
                .catch(async (err) => {
                    await expect(err.response.status).to.equal(400); //status check
                    //verify that posted details is incomplete
                    await expect(err.response.data.error).to.equal("Missing password");
                });
        });
    });

    describe('User log in test', async () => {
        it("POST Log in successful", async () => {
            await axios.post(baseURL + "/api/login", {
                email: "eve.holt@reqres.in",
                password: "cityslicka",
            })
                .then(async (res) => {
                    await expect(res.status).to.equal(200); //status check
                    //verify that user is logged in successfully
                    await expect(res.data.token).to.be.exist;
                });
        });

        it("POST Log in Unsuccessful", async () => {
            await axios.post(baseURL + "/api/login", {
                email: "peter@klaven",
            })
                .catch(async (err) => {
                    await expect(err.response.status).to.equal(400); //status check
                    //verify that posted details is incomplete
                    await expect(err.response.data.error).to.equal("Missing password");
                });
        });
    });

    it("GET List of users with delay params", async () => {
        await axios.get(baseURL + "/api/users", { params: { delay: 3 } })
            .then(async (res) => {
                await expect(res.status).to.equal(200);
                await expect(res.data.page).to.equal(1); //page 1
                await expect(res.data.per_page).to.equal(6); //6 users per page
                await expect(res.data.total).to.equal(12); // total number of users
                await expect(res.data.data.length).to.equal(6); //6 users per page
                await expect(res.duration).to.greaterThanOrEqual(3000); //due to delay should be > 3 secs
            });
    });

    //Log every request and response using interceptors. 
    //Return Response Duration
    axios.interceptors.request.use(function (req) {
        req.time = { startTime: new Date() };
        console.log("Request => " + req.method + " : " + req.url);
        return req;
    },
        (err) => {
            return Promise.reject(err);
        }
    );

    axios.interceptors.response.use(function (res) {
        res.config.time.endTime = new Date();
        res.duration = res.config.time.endTime - res.config.time.startTime;
        console.log("Response Data => " + res.data);
        return res;
    },
        (err) => {
            return Promise.reject(err);
        }
    );
});
