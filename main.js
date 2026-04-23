
const RenderSongs = (data) => {
    const token = localStorage.getItem("token");
    const songDiv = document.getElementById('songs');
    songDiv.innerHTML = '';

    // Sort alphabetically
    data.sort((a, b) => a.title.localeCompare(b.title));

    const difficulties = ["Easy", "Medium", "Hard"];

    difficulties.forEach(level => {

        const filtered = data.filter(x => x.diff === level);

        if (filtered.length > 0) {

            songDiv.innerHTML += `
                <div id="${level}" class="mb-4">
                    <div class="d-flex justify-content-between align-items-center border-bottom pb-2">
                        <h2 class="mb-0">${level}</h2>
                        <a href="#top" class="btn btn-sm btn-outline-dark">
                            Back to Top ↑
                        </a>
                    </div>
                </div>
            `;

            filtered.forEach(x => {

    songDiv.innerHTML += `
<div class="song-box">

    <div class="d-flex justify-content-between align-items-center">

        <div class="left-box">
            <div class="song-title">${x.title}</div>
            <div class="song-artist">${x.artist}</div>
        </div>

        <div class="d-flex gap-2">

    <a href="${x.link}" target="_blank"
       class="btn btn-dark">
        Open Link
    </a>

    ${
        token ? `
        <button onclick='showEditForm(${JSON.stringify(x)})'
                class="btn btn-outline-primary">
            Edit
        </button>

        <button onclick="deleteSong(${x.id})"
                class="btn btn-outline-danger">
            Delete
        </button>
        ` : ""
    }

</div>
    </div>

    <!-- Hidden Edit Form -->
    <div id="edit-form-${x.id}" class="mt-3" style="display:none;"></div>

</div>
`;
});
        }
    });
};


function getAllSongs(){
    // Easiest way to check if things are happening
    console.log(1);
    const xhr = new XMLHttpRequest();
    xhr.onload = ()=>{
        if(xhr.status == 200){
            const data = JSON.parse(xhr.response) || [];
            console.log(data);
            RenderSongs(data);
        }
    }

    xhr.open('GET','http://127.0.0.1:8000/library', true) // Link found inside the docs executing the get and copying the request URL
    xhr.send();
}


function createSong(){

    const title = document.getElementById('title').value;
    const artist = document.getElementById('artist').value;
    const chords = parseInt(document.getElementById('chords').value);
    const link = document.getElementById('link').value;



    // FRONTEND VALIDATION

    if (!title || !artist || !link) {
        alert("All fields are required."); 
        return;
    }

    if (isNaN(chords) || chords < 0) {
        alert("Number of chords must be 0 or greater.");
        return;
    }

    // Simple URL validation
    try {
        new URL(link);
    } catch {
        alert("Please enter a valid URL (must start with http:// or https://)");
        return;
    }



    const xhr = new XMLHttpRequest();

    xhr.onload = () => {
        if(xhr.status === 200){
            getAllSongs();  // refresh list
        }
    }

    xhr.open('POST','http://127.0.0.1:8000/library', true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.send(JSON.stringify({
        title: title,
        artist: artist,
        number_of_chords: chords,
        link: link
    }));

    // Clear inputs
    document.getElementById('title').value = '';
    document.getElementById('artist').value = '';
    document.getElementById('chords').value = '';
    document.getElementById('link').value = '';
}

function editSong(id){

    const title = prompt("Enter new title:");
    const artist = prompt("Enter new artist:");
    const chords = parseInt(prompt("Enter number of chords:"));
    const link = prompt("Enter new link:");

    if (!title || !artist || !link || isNaN(chords)) {
        alert("All fields are required.");
        return;
    }

    const xhr = new XMLHttpRequest();

    xhr.onload = () => {
        if(xhr.status === 200){
            getAllSongs();
        } else {
            alert("Edit failed");
        }
    };

    xhr.open('PUT', `http://127.0.0.1:8000/library/${id}`, true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.send(JSON.stringify({
        title: title,
        artist: artist,
        number_of_chords: chords,
        link: link
    }));
}

function deleteSong(id){

    const xhr = new XMLHttpRequest();

    xhr.onload = () => {
        if(xhr.status === 200){
            getAllSongs();  // refresh list
        } else {
            alert("Delete failed");
        }
    };

    xhr.open('DELETE', `http://127.0.0.1:8000/library/${id}`, true);
    xhr.send();
}



function showEditForm(song){

    const container = document.getElementById(`edit-form-${song.id}`);

    container.style.display = "block";

    container.innerHTML = `
        <div class="card p-4 shadow-sm">

            <div class="mb-3">
                <label class="form-label fw-bold">
                    Song Title
                </label>
                <input id="edit-title-${song.id}" 
                       class="form-control"
                       value="${song.title}">
            </div>

            <div class="mb-3">
                <label class="form-label fw-bold">
                    Artist
                </label>
                <input id="edit-artist-${song.id}" 
                       class="form-control"
                       value="${song.artist}">
            </div>

            <div class="mb-3">
                <label class="form-label fw-bold">
                    Number of Chords
                </label>
                <input id="edit-chords-${song.id}" 
                       type="number"
                       class="form-control"
                       value="${song.number_of_chords}">
            </div>

            <div class="mb-3">
                <label class="form-label fw-bold">
                    Song Link
                </label>
                <input id="edit-link-${song.id}" 
                       class="form-control"
                       value="${song.link}">
            </div>

            <div class="d-flex gap-2">
                <button onclick="updateSong(${song.id})"
                        class="btn btn-success">
                    Save Changes
                </button>

                <button onclick="cancelEdit(${song.id})"
                        class="btn btn-secondary">
                    Cancel
                </button>
            </div>

        </div>
    `;
}

function updateSong(id){

    const title = document.getElementById(`edit-title-${id}`).value;
    const artist = document.getElementById(`edit-artist-${id}`).value;
    const chords = parseInt(document.getElementById(`edit-chords-${id}`).value);
    const link = document.getElementById(`edit-link-${id}`).value;

    if (!title || !artist || !link || isNaN(chords)) {
        alert("All fields are required.");
        return;
    }

    const xhr = new XMLHttpRequest();

    xhr.onload = () => {
        if(xhr.status === 200){
            getAllSongs();
        } else {
            alert("Update failed");
        }
    };

    xhr.open('PUT', `http://127.0.0.1:8000/library/${id}`, true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.send(JSON.stringify({
        title: title,
        artist: artist,
        number_of_chords: chords,
        link: link
    }));
}

function cancelEdit(id){
    const container = document.getElementById(`edit-form-${id}`);
    container.style.display = "none";
    container.innerHTML = "";
}

//IIFE
(() => {
    getAllSongs();
    updateUI();
})();


function signup() {
    const usernameInput = document.getElementById('signup-username');
    const emailInput = document.getElementById('signup-email');
    const passwordInput = document.getElementById('signup-password');

    const username = usernameInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;

    fetch('http://127.0.0.1:8000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message || data.detail);

        
        usernameInput.value = '';
        emailInput.value = '';
        passwordInput.value = '';
    });
}

function login() {
    const usernameInput = document.getElementById('login-username');
    const passwordInput = document.getElementById('login-password');

    const username = usernameInput.value;
    const password = passwordInput.value;

    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    fetch('http://127.0.0.1:8000/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.access_token) {
            localStorage.setItem("token", data.access_token);
            alert("Logged in!");
            updateUI();

            
            usernameInput.value = '';
            passwordInput.value = '';
        } else {
            alert("Login failed");
        }
    });
}

function updateUI() {
    const token = localStorage.getItem("token");

    const addSongSection = document.getElementById("add-song-section");
    const authSection = document.getElementById("auth-section");

    if (token) {
        // Logged in
        addSongSection.style.display = "block";
        authSection.style.display = "none";
    } else {
        // Logged out
        addSongSection.style.display = "none";
        authSection.style.display = "block";
    }

    // Re-render songs to update buttons
    getAllSongs();
}

function logout() {
    localStorage.removeItem("token");
    updateUI();
}