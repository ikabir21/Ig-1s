import React from 'react';
import Card from './card';
import './dashboard.css';
import user from '../response';

function content() {
  console.log(user);
  return (
    <div className='content'>
      <div className='about'>
        <h1>ABOUT</h1>

        {user.followersArr.map((i, k) => (
          <Card name={i.name} username={i.username} img={i.avatart} />
        ))}
      </div>
    </div>
  );
}
export default content;
