import React from 'react';
import Content from './Content';
import Avtar from './Avtar';
import './dashboard.css';
import user from '../image/users.png';
import one from '../image/1.png';
function Dashboard(props) {
  return (
    <div className='glass'>
      <div className='dashboard'>
        <div className='user'>
          <Avtar img={user} />
          <h4>Your-Name</h4>
          <p></p>
        </div>
        <div className='links'>
          <div className='link' id='about'>
            <img src={one} alt='followers' className='images' />
            <h4>Followers</h4>
          </div>
          <div className='link' id='project'>
            <img src={one} alt='your-name' className='images' />
            <h4>Followings</h4>
          </div>
          <div className='link' id='blog'>
            <img src={one} alt='your-name' className='images' />
            <h4>BLOG</h4>
          </div>
        </div>
      </div>
      <Content />
    </div>
  );
}

export default Dashboard;
