import React, {useEffect, useState} from "react";
import { connect } from "react-redux";
import { compose } from "../../utils";
import LoadBar from "../load-bar"
import "./home-page.css";

import hand from "../../img/icons/drag.png";
import rotate from "../../img/icons/rotate.png";
import rotate2 from "../../img/icons/arrow-rotate.png";
import Navigation from "../navigation";
// import addImg from "../../img/icons/add.png";
import handImg from "../../img/icons/hand.svg";
// import textureImg from "../../img/icons/texture.png";

import arrowImg from "../../img/icons/arrow.png";
import FloorList from "../floor-list";
import Modal from "../modal-window";
import { bindActionCreators } from "redux";
import * as actions from "../../actions";
import io from 'socket.io-client'
const socket = io('http://localhost:7000')




const HomePage = ({ 
  dispatchSelectTypeOfChange,
  changeStatusCamera,
  activeObject,
  camera, 
  dispatchSelectActionModel
}) => {
  // const [drag, setDrag] = useState();
  // const handlerDrag = (action) => {
  //   if (!drag){
  //     socket.emit('getActionDrag', action);
  //     setDrag(true)
  //   } else {
  //     setDrag(false)
  //   }
  //   // console.log(drag, 'drag')
  //   // 
  // }
  // useEffect(() => {
  //   socket.on('getActionDrag', payload => {
  //     dispatchSelectActionModel(payload)

  //   });
  // }, []);
  // console.log(activeObject.action, ' activeObject.action')

  return (
  
    <div>
   <Modal />
      <Navigation />

      <LoadBar />

      <div className="main">
        <div className="instrum">
          <div className="controls">
            <div
              className={
                camera.status === "panorama"
                  ? "controls-btn hand controls-btn__active-cam"
                  : "controls-btn hand"
              }
              onClick={() => changeStatusCamera("panorama")}
            >
              <img src={handImg} alt="Logo" />
            </div>{" "}


            <div
              className={
                camera.status === "default"
                  ? "controls-btn hand controls-btn__active-cam"
                  : "controls-btn hand"
              }
              onClick={() => changeStatusCamera("default")}
            >
              <img src={arrowImg} alt="Logo" />
            </div>{" "}

            <div
              className={
                activeObject.action === "drag"
                  ? "controls-btn hand controls-btn__active"
                  : "controls-btn hand"
              }
              onClick={() => dispatchSelectActionModel("drag")}
            >
              <img src={hand} alt="Logo" />
            </div>{" "}
            <div
              className={
                activeObject.action === "rotate"
                  ? "controls-btn controls-btn__active"
                  : "controls-btn"
              }
              onClick={() => dispatchSelectActionModel("rotate")}
            >
              {" "}
              <img src={rotate} alt="Logo" />
            </div>{" "}
            <div
              className="controls-btn"
            >
              <img src={rotate2} alt="Logo" />
            </div>{" "}
           
            {/* <div
              className="controls-btn"
              onClick={() => dispatchSelectTypeOfChange("add_model")}
            >
              <img src={addImg} alt="Logo" />
            </div> */}

           

          </div>

        </div>
      </div>{" "}
      <FloorList /> 
    </div>
  );
};


const mapStateToProps = (state) => {
  return {
    activeObject : state.main.activeObject,
    camera: state.main.camera
  };
};
function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    ...actions,
  }, dispatch);
}


export default compose(connect(mapStateToProps, mapDispatchToProps))(
  HomePage
);
