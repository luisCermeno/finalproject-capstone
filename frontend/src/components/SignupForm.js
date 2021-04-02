import { useState, useEffect } from 'react';
import {TextField, Button} from '@material-ui/core';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import {Divider} from '@material-ui/core';




import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import VisibilityTwoToneIcon from '@material-ui/icons/VisibilityTwoTone';
import VisibilityOffTwoToneIcon from '@material-ui/icons/VisibilityOffTwoTone';
import AccountCircleTwoToneIcon from '@material-ui/icons/AccountCircleTwoTone';
import CircularProgress from '@material-ui/core/CircularProgress';

const SignupForm = props => {
  const [credentials, setcredentials] = useState({username: '', password: ''})
  const [profile, setprofile] = useState({
    first_name: '',
    last_name: '',
    school: '',
    major: '',
    year: '',
    description: '',
  })
  const [showPassword, setshowPassword] = useState(false)
  const [loading, setloading] = useState(false)

  //effect hooks
  useEffect(() => {
    return () => {
      props.seterrormsg('')
    }
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    setloading(false)
    console.log(props.data.schools)
  }, [props.errormsg])

  const handleSubmit = e => {
    e.preventDefault()
    setloading(true) 
    props.handle_signup(credentials, profile)
  }


  //TODO ! improve this with json stringify
  const handle_change = e => {
    const name = e.target.name;
    const value = e.target.value;
    switch (name) {
        case 'username':
            setcredentials({...credentials, username: value})
            break
        case 'password':
            setcredentials({...credentials, password: value})
            break
        case 'school':
          setprofile({...profile, school: value})
          break
        default:
            console.log('error on switch')
    }
  }

  const handleClickShowPassword = () => {
    setshowPassword(!showPassword)
  }

  //TODO ! add fields for profile !!
  return (
    <form style={ {marginBottom: "20px",} } autoComplete="off" onSubmit={handleSubmit}>
      <div style={{marginBottom: "20px",}}>
        <TextField style={{width: "100%"}}
          required
          id="standard-required" 
          label="Username" 
          name="username" 
          value={credentials.username} 
          onChange={handle_change}
          InputProps={{
            endAdornment:
            <InputAdornment position="start">
              <AccountCircleTwoToneIcon/>
            </InputAdornment>
          }}
        />
        <TextField style={{width: "100%"}}
          required
          id="standard-password-input" 
          type={showPassword ? "text" : "password"} 
          label="Password" 
          name="password" 
          value={credentials.password} 
          onChange={handle_change}
          InputProps={{
            endAdornment:
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                >
                  {showPassword ? <VisibilityTwoToneIcon /> : <VisibilityOffTwoToneIcon />}
                </IconButton>
              </InputAdornment>
          }}
        />
        <FormControl required style={{width: "100%"}}>
          <InputLabel>School</InputLabel>
          <Select
            name = 'school'
            value={profile.school}
            onChange={handle_change}
          >
            {props.data.schools.map( obj => (
              <MenuItem value={obj.id}>{obj.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <TextField style={{width: "100%"}}
          id="standard-required" 
          label="First Name" 
          name="first_name" 
          value={profile.first_name} 
          onChange={handle_change}
        />



      </div>

      <h3>{props.errormsg}</h3>
      {/* button section */}
      {loading?
        <CircularProgress style={{margin: "0 auto"}}/>
      :
        <Button style= {{width: "100%"}}type="submit" variant="contained" color="primary">Sign Up</Button>
      }
    </form>
  )
}


export default SignupForm
