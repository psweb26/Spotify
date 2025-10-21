let currentSong = new Audio();
let currentSongIndex = 0;
let songs = [];

function formatTime(seconds) {
    if (isNaN(seconds) || seconds === Infinity) return "00:00";

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

async function getSongs() {
    let a = await fetch("http://127.0.0.1:5500/songs/");
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split("/songs/")[1]);
        }
    }
    return songs;
}

function playMusic(track, pause = false) {
    const fullPath = `/songs/${track}`;
    currentSong.src = fullPath;

    currentSongName = track
        .replaceAll("%20", " ")
        .replaceAll("%5D", " ")
        .replaceAll("%2C", " ")
        .replace(".mp3", "");

    document.querySelector(".songInfo").innerHTML = decodeURI(currentSongName);
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00";

    if (!pause) {
        currentSong.play()
            .then(() => {
                document.getElementById("play").src = "links.svg/pause.svg";
                highlightCurrentSong();
            })
            .catch(error => {
                console.error("Error playing song:", error);
            });
    }
}

function playNextSong() {
    if (songs.length === 0) return;

    currentSongIndex = (currentSongIndex + 1) % songs.length;
    playMusic(songs[currentSongIndex]);
}

function playPreviousSong() {
    if (songs.length === 0) return;

    // If song is more than 3 seconds in, restart it
    if (currentSong.currentTime > 3) {
        currentSong.currentTime = 0;
        return;
    }

    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    playMusic(songs[currentSongIndex]);
}

function highlightCurrentSong() {
    const songItems = document.querySelectorAll('.songList ul li');
    songItems.forEach((item, index) => {
        if (index === currentSongIndex) {
            item.classList.add('playing');
        } else {
            item.classList.remove('playing');
        }
    });
}

async function main() {
    try {
        songs = await getSongs();
        if (songs.length > 0) {
            currentSongIndex = 6; // Default starting index
            playMusic(songs[currentSongIndex], true);
        }

        let songUL = document.querySelector(".songList ul");
        if (!songUL) {
            console.error("Could not find .songList ul element");
            return;
        }

        // Clear existing content
        songUL.innerHTML = '';

        // Add all songs to the list
        songs.forEach((song, index) => {
            const songName = song.replaceAll("%20", " ").replaceAll("%5D", " ").replaceAll("%2C", " ").replaceAll(".mp3", " ").replaceAll("/songs/", " ");
            const li = document.createElement("li");
            li.innerHTML = `
                <img class="invert" src="links.svg/music.svg" alt="">
                <div class="info">
                    <div>${songName}</div>
                    <div>Pransh Sharma</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert cursor" src="links.svg/play.svg" alt="">
                </div>
            `;

            li.addEventListener("click", () => {
                currentSongIndex = index;
                playMusic(song);
            });

            songUL.appendChild(li);
        });

        // Play/Pause button
        const playButton = document.getElementById("play");
        playButton.addEventListener("click", () => {
            if (currentSong.paused) {
                currentSong.play();
                playButton.src = "links.svg/pause.svg";
            } else {
                currentSong.pause();
                playButton.src = "links.svg/play.svg";
            }
        });

        // Next/Previous buttons
        document.getElementById("next").addEventListener("click", playNextSong);
        document.getElementById("previous").addEventListener("click", playPreviousSong);

        // TimeUpdate event listener
        currentSong.addEventListener("timeupdate", () => {
            const currentTime = currentSong.currentTime;
            const duration = currentSong.duration;

            document.querySelector(".songTime").innerHTML =
                `${formatTime(currentTime)} / ${formatTime(duration)}`;

            const progress = (currentTime / duration) * 100;
            document.querySelector('.seekbar').style.setProperty('--progress', `${progress}%`);
        });

        // Song ended event
        currentSong.addEventListener('ended', playNextSong);

        // Seekbar click handler
        document.querySelector(".seekbar").addEventListener("click", e => {
            const seekbar = e.target;
            const rect = seekbar.getBoundingClientRect();
            const percent = Math.min(Math.max(0, (e.clientX - rect.left) / rect.width), 1);

            document.querySelector('.seekbar').style.setProperty('--progress', `${percent * 100}%`);

            if (currentSong.duration) {
                currentSong.currentTime = currentSong.duration * percent;
            }
        });

    } catch (error) {
        console.error("Error in main function:", error);
    }

    // Adding an event listener for iconCont
    document.querySelector(".iconCont").addEventListener("click", () => {
        document.querySelector(".left").classList.toggle("active");
        document.body.classList.toggle("sidebar-open");
    });
    
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").classList.toggle("active");
        document.body.classList.toggle("sidebar-open");
    });
}

main();