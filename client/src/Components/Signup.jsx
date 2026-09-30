import { useState } from 'react'

function Signup() {
    const [username, setUsername] = useState("");
    const [userPass, setPassword] = useState("");
    const [firstName, setFirst] = useState("");
    const [secondName, setSecond] = useState("");
    const [message, setMessage] = useState("");

    async function handleSubmit(event){
        event.preventDefault();
        try{
            const response = await fetch(
            "http://localhost:9000/signup",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username,
                    userPass: userPass,
                    firstName: firstName,
                    secondName: secondName
                })
            }
            );
            
            const data = await response.json();
            if(response.ok){
                setMessage(data.message);
                setFirst("");
                setSecond("");
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
            <h2>Sign Up</h2>
            <h3>{message}</h3>
            <form className='signClass' onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder='First Name...'
                    value={firstName}
                    onChange={(event) => setFirst(event.target.value)}
                >
                </input>
                <input
                    type="text"
                    placeholder='Second Name...'
                    value={secondName}
                    onChange={(event) => setSecond(event.target.value)}
                >
                </input>
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

export default Signup;