const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
    host: '/',
    port: '3001'
})
const myVideo = document.createElement('video')
myVideo.muted = true //so that we don't listen to our own audio
const peers = {}

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}). then(stream => {
    addVideoStream(myVideo, stream)

    //answer the call when a new user joins
    myPeer.on('call', call =>{
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on('user-connected', userId => {
        setTimeout(connectToNewUser, 1000, userId, stream)
        console.log('User connected: ' + userId)
    })
})

//to enable faster video removal of left users
socket.on('user-disconnected', userId =>{
    if(peers[userId]) peers[userId].close()
})

myPeer.on('open', id =>{
    socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream){
    //make a call when a new user joins
    const call = myPeer.call(userId, stream)
    
    //Receiving the video from the other user and adding it to the video element on our page
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })

    //remove video if person disconnects
    call.on('close', ()=>{
        video.remove()
    })

    peers[userId] = call
}


// socket.on('user-connected', (userId) =>{
//     console.log('User connected: ' + userId)
// })

function addVideoStream(video, stream){
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () =>{
        video.play()
        console.log('video playing')
        //means that once the stream is setup and video is loaded onto the page, play the video!
    })
    videoGrid.append(video)
}


