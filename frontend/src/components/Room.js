import {useState, useEffect} from 'react'
import { matchPath } from "react-router";
import history from '../history'
import Peer from 'peerjs'


let peer
let dataConnections = []

const Room = props => {
  //get the room id matching the history path
  const roomID = matchPath(history.location.pathname, {
    path: "/room/:roomID",
    exact: true,
    strict: false
  }).params.roomID;

  //getTimestamp function
  const getTimestamp = () => {
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date+' '+time;
    return dateTime
  }

  //getMessageobject function
  const createMsgObj = (username, body) => {
    return {
      username: username,
      body: body,
      timestamp: getTimestamp()
    }
  }


  //state hooks
  const [participants, setparticipants] = useState([])
  const [messages, setmessages] = useState([])
  const [msg, setmsg] = useState('')
  const [error, seterror] = useState('')

  //******DJANGO SERVER LOG*******
  //log in room in django server
  const logroom = (action, peerID) => {
    fetch('http://localhost:8000/room/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `JWT ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        action: action,
        roomID: roomID,
        peerID: peerID,
      })
    })
    .then(res => res.json())
    .then(json => {
      console.log(json)
      if (action != 'leave') {
        setparticipants(json.participants)
        setmessages(json.messages)
        json.participants.forEach(par => {
          if (par.peerID != peerID){
            const newDataConnection = peer.connect(par.peerID,{metadata: {username: props.username}})
            newDataConnection.on('open',()=>{
              console.log(`New data connection open with ${par.username}!`)

              dataConnections.push({peerID: par.peerID, dataConnection: newDataConnection})
              console.log('dataConnections updated:')
              console.log(dataConnections)

              newDataConnection.on('data',data=>{
                console.log(data)
                setmessages(messages => [...messages, createMsgObj(par.username,data)])
              })
            })

              newDataConnection.on('close', () => {
              console.log(`Data connection with ${par.username} has closed`)
              setparticipants(oldparticipants => oldparticipants.filter( (obj, index, arr) => { 
                return obj.peerID != par.peerID;
              }))
            })

            newDataConnection.on('error', error=>{console.log(error)})
          }
        })
        // dataConnection = peer.connect()
        //call other participants
      }
    })
  }
  //logpeer in django server 
  const logpeer = (action, peerID) => {
    if (action === 'logout') {logroom('leave', peerID)}
    fetch('http://localhost:8000/logpeer/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `JWT ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        action: action,
        username: props.username,
        peerID: peerID,
      })
    })
    .then(res => res.json())
    .then(json => {
      if (action === 'login') {logroom('join', peerID)}
      console.log(json)
    })
  }
  //**************************************
  //effect hooks
  useEffect(() => {
    console.log(`Room ${roomID}  mounted`)
    peer = new Peer(undefined, {
      host: '/',
      port: '3001'
    })
    peer.on('open', id => {
      console.log(`Peer connection open. ID: "${id}" .c Listening for calls..`)
      logpeer('login', id)
    })
    peer.on('connection', dataConnection => {
      console.log(`New data connection from ${dataConnection.metadata.username}`)
      setparticipants(oldparticipants => [...oldparticipants,{username: dataConnection.metadata.username, peerID: dataConnection.peer}])
      
      dataConnections.push({peerID: dataConnection.peer, dataConnection: dataConnection})
      console.log('dataConnections updated:')
      console.log(dataConnections)
      
      dataConnection.on('data', data=>{
        console.log(data)
        setmessages(messages => [...messages, createMsgObj(dataConnection.metadata.username,data)])
      })
      dataConnection.on('close', () => {
        console.log(`Data connection with ${dataConnection.metadata.username} has closed`)
        setparticipants(oldparticipants => oldparticipants.filter( (obj, index, arr) => { 
          return obj.peerID != dataConnection.peer;
        }))
      })
    })
    peer.on('disconnected', peerID => {
      console.log('Peer connection closed')
      logpeer('logout', peerID)
    })
    peer.on('error', err=>{console.log(err)})

    //destoy peer on window close
    window.onunload = (e) => {
      if (peer !== undefined) peer.destroy()
    }

    return () => {
      console.log(`Room ${roomID}  unmounted`)
      if (peer !== undefined){peer.destroy()}
    }
  }, [])
  //effect hooks for debugging
  useEffect(() => {
    console.log('Participants updated:')
    console.log(participants)
  }, [participants])
  useEffect(() => {
    console.log('Messages updated:')
    console.log(messages)
  }, [messages])
  useEffect(() => {
    console.log('Messages updated:')
    console.log(messages)
  }, [messages])

  //form functions
  const handleSend = e => {
    e.preventDefault()
    //post message to django server
    fetch('http://localhost:8000/message/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `JWT ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        roomID: roomID,
        username: props.username,
        body: msg,
      })
    })
    .then(res => res.json())
    .then(json => console.log(json))
    //update messages in the DOM
    setmessages(messages => [...messages, createMsgObj(props.username, msg)])

    //send message to connected peers
    dataConnections.forEach(obj => {
      obj.dataConnection.send(msg)
    })
    
  }

  //render
  return (
    <div>
      <h2>Welcome to room {roomID}, {props.username}</h2>
      <div>
        <h3>Active users:</h3>
        <ul>
          {participants.map( (peer,index) => (<li key={index}>{peer.peerID} is {peer.username}</li>) )}
        </ul>
      </div>
      <div>
        <h3>Messages:</h3>
        <ul>
          {messages.map( (obj,index) => (<li key={index}>{obj.username}: {obj.body}</li>) )}
        </ul>
      </div>
      <div>
        <h3>Send Message:</h3>
        <form onSubmit= {handleSend}>
          <input onChange = {e => setmsg(e.target.value)} type='text' placeholder='Type your message'></input>
          <input  type='submit' value='Send' disabled={(msg === '')}/>
        </form>
        <h5>{error}</h5>
      </div>
    </div>
  )
}

export default Room
