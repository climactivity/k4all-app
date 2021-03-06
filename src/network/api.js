import axios from 'axios'

const verbose = false;
var appContext = null;

const baseUrl = "https://k4all.dastreibendewerk.de/app/"// works on android emulator ONLY!!

function doPostAuthorized(url, token, data, onSuccess, onError) {
    axios.post(baseUrl + url, data, {
        headers: {
            "Access-Control-Allow-Origin": "*",
            'Content-Type': 'application/json',
            "Authorization": "Bearer " + token
        }
    }).then((res) => {
        if (verbose) console.log(res);
        onSuccess(res);
    }).catch((err) => {
        if (verbose) console.log("POST to " + url + "\n Payload: " + JSON.stringify({
            headers: {
                "Authorization": "Bearer " + token
            }, data: data
        }), err)
        if (err.response.status >= 400 && err.response.status < 500) {
        }
        onError(err)

    })
}

function doPost(url, data, onSuccess, onError) {
    axios.post(baseUrl + url, data).then((res) => {
        if (verbose) console.log(res);
        onSuccess(res);
    }).catch((err) => {
        if (verbose) {
            console.log("POST to " + url + "\n Payload: " + JSON.stringify(data));
            if (err.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.log(err.response.data);
                console.log(err.response.status);
                console.log(err.response.headers);
            } else if (err.request) {
                // The request was made but no response was received
                // `err.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                console.log(err.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.log('Error', error.message);
            }
        }
        onError(err)
    })
}

function doGetWithParams(url, token = "", data, onSuccess, onError) {
    axios.get(baseUrl + url, {
        headers: {
            "Authorization": "Bearer " + token
        },
        params: data
    }).then((res) => {
        if (verbose) console.log(res);
        onSuccess(res);
    }).catch((err) => {
        if (verbose) {
            console.log("GET to " + url, err)
            if (err.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.log(err.response.data);
                console.log(err.response.status);
                console.log(err.response.headers);
            } else if (e.request) {
                // The request was made but no response was received
                // `err.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                console.log(err.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.log('Error', error.message);
            }
        }
        if (err.response.status >= 400 && err.response.status < 500) {
        }
        onError(err)
    })
}

function doGet(url, token = "", onSuccess, onError) {
    axios.get(baseUrl + url, {
        headers: {
            "Authorization": "Bearer " + token
        },
    }).then((res) => {
        if (verbose) console.log(res);
        onSuccess(res);
    }).catch((err) => {
        if (verbose) console.log("GET to " + url, err)
        if (err.response.status >= 400 && err.response.status < 500) {
        }
        onError(err)
    })
}

export default {
    checkTokenValid(token, onSuccess, onError) {
        doGet('api/checkToken', token, onSuccess, onError);
    },
    checkEmailExists(email, onSuccess, onError) {
        doGetWithParams('api/checkEmail', "", {username: email}, onSuccess, onError);
    },
    login(email, password, onSuccess, onError) {
        let userdata = {
            username: email,
            password: password
        };
        doPost('api/login', userdata, onSuccess, onError);
    },
    register(userdata, onSuccess, onError) {
        doPost('api/register', userdata, onSuccess, onError);
    },

    requestPasswordReset(email, onSuccess, onError) {
        axios.get(baseUrl +"/api/resetPassword", {
            params: {username: email}
        }).then((res) => {
            if (verbose) console.log(res);
            onSuccess(res);
        }).catch((err) => {
            onError(err)
        })
    },


};