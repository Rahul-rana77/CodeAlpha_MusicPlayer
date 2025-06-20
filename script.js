// Sample playlist data
const playlist = [
    {
        title: "Midnight Dreams",
        artist: "Luna Echo",
        src: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
        duration: 180
    },
    {
        title: "Electric Waves",
        artist: "Neon Pulse", 
        src: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
        duration: 210
    },
    {
        title: "Cosmic Journey",
        artist: "Star Drift",
        src: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav", 
        duration: 195
    },
    {
        title: "Ocean Breeze",
        artist: "Wave Rider",
        src: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
        duration: 225
    },
    {
        title: "Mountain High",
        artist: "Peak Climber",
        src: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
        duration: 190
    }
];

// Player elements
const audio = document.getElementById('audio-player');
const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const shuffleBtn = document.getElementById('shuffle-btn');
const repeatBtn = document.getElementById('repeat-btn');
const progressBar = document.getElementById('progress-bar');
const progress = document.getElementById('progress');
const progressDot = document.getElementById('progress-dot');
const currentTimeEl = document.getElementById('current-time');
const totalTimeEl = document.getElementById('total-time');
const songTitle = document.getElementById('song-title');
const artistName = document.getElementById('artist-name');
const volumeRange = document.getElementById('volume-range');
const volumeIcon = document.getElementById('volume-icon');
const volumeValue = document.getElementById('volume-value');
const playlistContainer = document.getElementById('playlist-items');
const albumCover = document.querySelector('.album-cover');

// Player state
let currentTrackIndex = 0;
let isPlaying = false;
let isShuffling = false;
let isRepeating = false;
let isDragging = false;

// Initialize player
function init() {
    loadTrack(currentTrackIndex);
    renderPlaylist();
    updateVolumeIcon();
}

// Load track
function loadTrack(index) {
    const track = playlist[index];
    audio.src = track.src;
    songTitle.textContent = track.title;
    artistName.textContent = track.artist;
    
    // Reset progress
    progress.style.width = '0%';
    progressDot.style.left = '0%';
    currentTimeEl.textContent = '0:00';
    
    // Update playlist active state
    updatePlaylistActive();
}

// Format time
function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Toggle play/pause
function togglePlay() {
    if (isPlaying) {
        audio.pause();
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        albumCover.classList.add('paused');
        isPlaying = false;
    } else {
        audio.play().catch(e => {
            console.log('Playback failed:', e);
            // Fallback for demo purposes
            simulatePlayback();
        });
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        albumCover.classList.remove('paused');
        isPlaying = true;
    }
}

// Simulate playback for demo (when audio fails to load)
function simulatePlayback() {
    const track = playlist[currentTrackIndex];
    let currentTime = 0;
    const duration = track.duration;
    
    totalTimeEl.textContent = formatTime(duration);
    
    const interval = setInterval(() => {
        if (!isPlaying) {
            clearInterval(interval);
            return;
        }
        
        currentTime += 1;
        currentTimeEl.textContent = formatTime(currentTime);
        
        const progressPercent = (currentTime / duration) * 100;
        progress.style.width = `${progressPercent}%`;
        progressDot.style.left = `${progressPercent}%`;
        
        if (currentTime >= duration) {
            clearInterval(interval);
            if (isRepeating) {
                setTimeout(() => {
                    if (isPlaying) {
                        simulatePlayback();
                    }
                }, 500);
            } else {
                nextTrack();
            }
        }
    }, 1000);
}

// Next track
function nextTrack() {
    if (isShuffling) {
        currentTrackIndex = Math.floor(Math.random() * playlist.length);
    } else {
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    }
    loadTrack(currentTrackIndex);
    if (isPlaying) {
        setTimeout(togglePlay, 100);
    }
}

// Previous track
function prevTrack() {
    currentTrackIndex = currentTrackIndex === 0 ? playlist.length - 1 : currentTrackIndex - 1;
    loadTrack(currentTrackIndex);
    if (isPlaying) {
        setTimeout(togglePlay, 100);
    }
}

// Toggle shuffle
function toggleShuffle() {
    isShuffling = !isShuffling;
    shuffleBtn.classList.toggle('active', isShuffling);
}

// Toggle repeat
function toggleRepeat() {
    isRepeating = !isRepeating;
    repeatBtn.classList.toggle('active', isRepeating);
}

// Update volume
function updateVolume() {
    const volume = volumeRange.value / 100;
    audio.volume = volume;
    volumeValue.textContent = volumeRange.value;
    updateVolumeIcon();
}

// Update volume icon
function updateVolumeIcon() {
    const volume = parseInt(volumeRange.value);
    if (volume === 0) {
        volumeIcon.className = 'fas fa-volume-mute';
    } else if (volume < 30) {
        volumeIcon.className = 'fas fa-volume-down';
    } else {
        volumeIcon.className = 'fas fa-volume-up';
    }
}

// Toggle mute
function toggleMute() {
    if (volumeRange.value > 0) {
        volumeRange.setAttribute('data-previous', volumeRange.value);
        volumeRange.value = 0;
    } else {
        volumeRange.value = volumeRange.getAttribute('data-previous') || 70;
    }
    updateVolume();
}

// Seek audio
function seekAudio(e) {
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const clickPercent = (clickX / width) * 100;
    
    progress.style.width = `${clickPercent}%`;
    progressDot.style.left = `${clickPercent}%`;
    
    // For demo purposes, update current time based on track duration
    const track = playlist[currentTrackIndex];
    const seekTime = (clickPercent / 100) * track.duration;
    currentTimeEl.textContent = formatTime(seekTime);
    
    if (audio.duration) {
        audio.currentTime = (clickPercent / 100) * audio.duration;
    }
}

// Render playlist
function renderPlaylist() {
    playlistContainer.innerHTML = '';
    playlist.forEach((track, index) => {
        const item = document.createElement('div');
        item.className = 'playlist-item';
        item.innerHTML = `
            <div class="playlist-item-info">
                <div class="playlist-number">${index + 1}</div>
                <div class="playlist-text">
                    <h4>${track.title}</h4>
                    <p>${track.artist}</p>
                </div>
            </div>
            <div class="playlist-duration">${formatTime(track.duration)}</div>
        `;
        
        item.addEventListener('click', () => {
            currentTrackIndex = index;
            loadTrack(index);
            if (isPlaying) {
                setTimeout(togglePlay, 100);
            }
        });
        
        playlistContainer.appendChild(item);
    });
}

// Update playlist active state
function updatePlaylistActive() {
    const items = playlistContainer.querySelectorAll('.playlist-item');
    items.forEach((item, index) => {
        item.classList.toggle('active', index === currentTrackIndex);
    });
}

// Event listeners
playBtn.addEventListener('click', togglePlay);
prevBtn.addEventListener('click', prevTrack);
nextBtn.addEventListener('click', nextTrack);
shuffleBtn.addEventListener('click', toggleShuffle);
repeatBtn.addEventListener('click', toggleRepeat);
volumeRange.addEventListener('input', updateVolume);
volumeIcon.addEventListener('click', toggleMute);
progressBar.addEventListener('click', seekAudio);

// Audio event listeners
audio.addEventListener('loadedmetadata', () => {
    totalTimeEl.textContent = formatTime(audio.duration);
});

audio.addEventListener('timeupdate', () => {
    if (!isDragging && audio.duration) {
        const progressPercent = (audio.currentTime / audio.duration) * 100;
        progress.style.width = `${progressPercent}%`;
        progressDot.style.left = `${progressPercent}%`;
        currentTimeEl.textContent = formatTime(audio.currentTime);
    }
});

audio.addEventListener('ended', () => {
    if (isRepeating) {
        audio.currentTime = 0;
        audio.play();
    } else {
        nextTrack();
    }
});

audio.addEventListener('canplay', () => {
    console.log('Audio can play');
});

audio.addEventListener('error', (e) => {
    console.log('Audio error:', e);
});

// Initialize player
init();
