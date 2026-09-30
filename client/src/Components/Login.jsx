import { useState } from 'react'

function Login() {
    const [username, setUsername] = useState("");
    const [userPass, setPassword] = useState("");
    const [message, setMessage] = useState("");

    async function handleSubmit(event){
        event.preventDefault();
        try{
            const response = await fetch(
            "http://localhost:9000/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username,
                    userPass: userPass
                })
            }
            );
            
            const data = await response.json();
            if(response.ok){
                setMessage(data.message);
                setUsername("");
                setPassword("");
            } else {
                setMessage(data.message);
            }
        } catch(error){
            setMessage("Could not connect to server");
        }
    }
    return (
        <div>
            <h2>Log In</h2>
            <h3>{message}</h3>
                <form className='logClass' onSubmit={handleSubmit} >
                    <input
                        type="text"
                        placeholder='Username...'
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                    />
                    <input
                        type="text"
                        value={userPass}
                        placeholder='Password...'
                        onChange={(event) => setPassword(event.target.value)}
                    />
                    <button type='submit'> Submit </button>
                </form>
        </div>
    );
}

export default Login;