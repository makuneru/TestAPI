const axios = require('axios');
const {expect} = require('chai');

const baseURL = 'https://jsonplaceholder.typicode.com';
describe('Sample test for axios', async () => {
    it('GET request', async () => {
        await axios.get(baseURL + '/todos', { params : { id:5 }})
        .then(async (res) => {
            await expect(res.status).to.equal(200);
            console.log(res.data[0].id);
        })
        // .catch(async (err) => {
        //     if(err.response){
        //         console.log(err.response.status);
        //     }
        // });
    });

    it('POST request', async () => {
        await axios.post(baseURL + '/todos', { 
            title : 'New To Do List 3',
            completed : false,
            userId: 111
        }).then(async (res) => {
            await expect(res.status).to.equal(201);
            
            console.log(res.data);
        })
        // .catch(async (err) => {
        //     console.log(err);
        // });
    });

    it('PUT request', async () => {
        await axios.put(baseURL + '/todos/1', { 
            title : 'Return the defined fields',
            completed : false,
        }).then(async (res) => {
            await expect(res.status).to.equal(200);
            console.log(res.data);
        })
        // .catch(async (err) => {
        //     console.log(err);
        // });
    });

    it('PATCH request', async () => {
        await axios.patch(baseURL + '/todos/1', { 
            title : 'Return all fields',
            completed : false,
        }).then(async (res) => {
            await expect(res.status).to.equal(200);
            console.log(res.data);
        })
        // .catch(async (err) => {
        //     console.log(err);
        // });
    });

    it('DELETE request', async () => {
        await axios.delete(baseURL + '/todos/1')
        .then(async (res) => {
            await expect(res.status).to.equal(200);
            console.log(res.data);
        })
        // .catch(async (err) => {
        //     console.log(err);
        // });
    });

    it('SIMULTANEOUS REQUEST', async () => {
        await axios.all([
            await axios.get(baseURL + '/todos', { params : { _limit:2 }}),
            await axios.get(baseURL + '/posts', { params : { _limit:2 }})
        ])
        .then(async (res) => {
            for await (const response of res){
                expect(response.status).to.equal(200);
                console.log(response.data);
            }
        })
        // .catch(async (err) => {
        //     console.log(err);
        // });
    });


    it('CUSTOM HEADERS ', async () => {
        const config = {
            headers : {
                'Content-Type' : 'application/json',
                Authorization: 'sometoken'
            }
        }
        console.log(config)

        await axios.post(baseURL + '/todos', { 
            title : 'New To Do List 2',
            completed : false,
            userId: 111
        }, config)
        .then(async (res) => {
            await expect(res.status).to.equal(201);
            console.log(res.data);
        })
        // .catch(async (err) => {
        //     console.log(err);
        // });
    });

    //Interceptors
    axios.interceptors.request.use(config => {
        console.log(`${config.method.toUpperCase()} request sent to ${config.url} at ${new Date().getTime()}`);
        return config;
    }, error => {
        return Promise.reject(error);
    })
});