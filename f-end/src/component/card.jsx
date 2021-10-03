import React from 'react';
import Avtar from './Avtar';
function Card(props) {
  return (
    <div>
      <div>
        <Avtar img={props.img} />
      </div>
      <div>
        <h2>{props.username}</h2>
        <h2>{props.name}</h2>
      </div>
    </div>
  );
}
export default Card;
