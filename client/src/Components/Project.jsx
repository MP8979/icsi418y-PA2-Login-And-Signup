import { useState, useEffect } from 'react'

function Project(){

    const [users, setUsers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [projectMembers, setProjectMembers] = useState([]);
    const [message, setMessage] = useState("");
    const [projectName, setProjectName] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("Planning");
    const [selectedLead, setSelectedLead] = useState("");
    const [selectedMember, setSelectedMember] = useState("");

    useEffect(() => {
        async function fetchMembers(){
            try {
                const response = await fetch('http://localhost:9000/members');
                if(!response.ok){
                    throw new Error("Failed to connect");
                }
                const data = await response.json();
                setProjectMembers(data);
            } catch(error){
                console.error("Couldn't load project memberships: ", error);
            }
        }   
        fetchMembers();
    }, []);

    useEffect(() => {
        async function fetchUsers(){
            try {
                const response = await fetch('http://localhost:9000/users');
                if(!response.ok){
                    throw new Error("Failed to connect");
                }
                const data = await response.json();
                setUsers(data);
            } catch(error) {
                console.error("Couldn't load Users: ", error);
            }
        }

        fetchUsers();
    }, []);

    useEffect(() => {
        async function fetchProjects(){
            try{
                const response = await fetch("http://localhost:9000/projects");
                if(!response.ok){
                    throw new Error("Failed to connect");
                }
                const data = await response.json();
                setProjects(data);
            } catch(error) {
                console.error("Couldn't load projects: ", error)
            }
        }
        fetchProjects();
    }, []);

    async function handleDeleteMember(projectId, memberId){
        try{
            const response = await fetch("http://localhost:9000/deleteMember", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    projectId: projectId,
                    memberId: memberId,
                })
            });
            const data = await response.json();
            setMessage(data.message);

            if(response.ok){
                const memberResponse = await fetch("http://localhost:9000/members");
                if(memberResponse.ok){
                    const memberData = await memberResponse.json();
                    setProjectMembers(memberData);
                }
            }

        } catch(error){
            setMessage("Failure in deleting member: " + error);
        }
    }

    async function handleAddMember(event, projectId){
        event.preventDefault();
        try{
            const response = await fetch("http://localhost:9000/addMember", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    selectedMember: selectedMember,
                    projectId: projectId
                })

            });
            const data = await response.json();
            setMessage(data.message)
            if(response.ok){
                setSelectedMember("");
                const memberResponse = await fetch("http://localhost:9000/members");
                if(memberResponse.ok){
                    const memberData = await memberResponse.json();
                    setProjectMembers(memberData);
                }
            }
        } catch(error){
            setMessage("Failed to add member: ", error);
        }
    }

    async function handleSubmit(event){
        event.preventDefault();
        try{
            const response = await fetch(
                "http://localhost:9000/project",{
                    method: "POST",
                    headers: {
                    "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        projectName: projectName,
                        description: description,
                        status: status,
                        selectedLead: selectedLead
                    })
                }
            )
            const data = await response.json();
            if(response.ok){
                setMessage(data.message);
                setProjectName("");
                setDescription("");
                setStatus("Planning");
                setSelectedLead("");
                
                const projectResponse = await fetch("http://localhost:9000/projects");
                if(projectResponse.ok){
                    const projectData = await projectResponse.json();
                    setProjects(projectData);
                }
                const memberResponse = await fetch("http://localhost:9000/members");
                if(memberResponse.ok){
                    const memberData = await memberResponse.json();
                    setProjectMembers(memberData);
                }

            } else {
                setMessage(data.message);
            }
        } catch(error) { 
            setMessage("Failure in making project: " + error)
        }
    }

    return(
        <div>
            <h2>Create a Project</h2>
            <h3>{message}</h3>
            <form className='projClass' onSubmit={handleSubmit}>
                <input 
                type='text' 
                placeholder='Project Name...' 
                value={projectName}
                onChange={(event)=>setProjectName(event.target.value)}
                />
                <input 
                type='text'
                placeholder='Description...'
                value={description}
                onChange={(event)=>setDescription(event.target.value)}
                />
                <select 
                id="status"
                value={status}
                onChange={(event)=>setStatus(event.target.value)}>
                    <option value='Planning'>Planning</option>
                    <option value='Active'>Active</option>
                    <option value='Completed'>Completed</option>
                </select>
                <select id="lead"
                value={selectedLead}
                onChange={(event)=>setSelectedLead(event.target.value)}>
                    <option value = "">Select Leader</option>
                    {users.map((user) => (
                        <option 
                        key={user._id} 
                        value={user._id}>
                            {user.username}
                        </option>
                    ))}
                </select>
                <button type='submit'> Submit </button>
            </form>
            <div className='createdProjects'>
                <h2>Projects:</h2>
                {projects.length === 0 ? (
                    <h3>No projects made yet!</h3>
                ) : (
                    projects.map((project) => (
                        <div 
                        className="project"
                        key = {project._id}
                        >
                            <h3>{project.projectName}</h3>
                            <p>{project.description}</p>
                            <p>{project.status}</p>
                            <p>Project Leader: {project.selectedLead}</p>
                            <p>Project Members: </p>
                            {projectMembers.filter((membership) => 
                            String(membership.project_id) === String(project._id)).map((membership) => {
                                const member = users.find(
                                    (user) => String(user._id) === String(membership.user_id)
                                );
                                return member ? (
                                    <div key={membership._id}>
                                        <p>{member.username}</p>
                                        <button
                                        type = "button"
                                        id = "delete"
                                        onClick={()=>handleDeleteMember(project._id, membership.user_id)}
                                        >Delete</button>
                                    </div>
                                ) : null;
                            })}

                            <form className='projClass' onSubmit={(event) => handleAddMember(event, project._id)}>
                                <select
                                id = 'member'
                                value = {selectedMember}
                                onChange={(event) => setSelectedMember(event.target.value,)}
                                >
                                    <option value="">Select Member to Join</option>
                                    {users.map((user) => (
                                        <option
                                        key={user._id}
                                        value={user._id}>
                                            {user.username}
                                        </option>
                                    ))}
                                </select>
                                <button type='submit'> Submit </button>
                            </form>
                        </div>
                    ))
                )}
                
            </div>
        </div>
    );
}

export default Project;