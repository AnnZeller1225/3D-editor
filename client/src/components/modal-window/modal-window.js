import "./styles.css";

import React from "react";
import { connect } from "react-redux";
import { compose } from "../../utils";
import TextureList from "../texture-list/texture-list";
import ModelList from "../model-list/model-list";
import ModalConfirm from "../modal-confirm";
import { bindActionCreators } from "redux";
import * as actions from "../../actions";
import io from 'socket.io-client'
const socket = io('http://localhost:7000')

const ModalWindow = ({
  modal,
  activeObject,
  resetModal,
  saveChanges
}) => {


  const handlerClick = (serverEvent, payload  ) => {
    socket.emit(`${serverEvent}`, payload );

    saveChanges()
  }

  let text, serverEvent, data;
  // в зависимости от вида изменений мы шлем разную data и вызываемое событие.

  // перенести куда-то для избежания дублирования присвоения переменных, например в хандлерклик 
  if (modal.typeOfChange === "replace") {
    text = "заменить элемент";
    serverEvent = 'replaceModel';
    data = {
      prev: activeObject.selectedModel,
      next: activeObject.newModel
    }


  } else if (modal.typeOfChange === "add_model") {
    text = "добавить элемент";
    serverEvent = 'addModel';
    data = activeObject.newModel
  } else if (modal.typeOfChange === "change_texture") { // пока работает для пола 
    text = "изменить текстуру";
    serverEvent = 'changeTexture';
    data = {
      prev:  activeObject.surface, // тут будем разделять - стену или пол отправлять
      next: activeObject.newTexture
    }

    // console.log(activeObject.wall, activeObject.surface,'ModalWindow')

  }
  else if (modal.typeOfChange === "add_furnishings_wall") {
    text = "добавить предмет интерьера на стену";
  } else {
    text = "другое действие";
  }

  if (modal.typeOfChange === "delete_model") {
    return <ModalConfirm />
  } else {

    return (
  
      <div className={modal.isOpen ? "modal-w" : "hide"}>

        <div className="modal">
          <h2>{text}</h2>
          {modal.typeOfChange === "change_texture" ? <TextureList /> : null}
          {modal.typeOfChange === "replace" ? <ModelList status={modal.typeOfChange} /> : null}
          {modal.typeOfChange === "add_model" ? <ModelList status={modal.typeOfChange} /> : null}

          {modal.typeOfChange === "add_furnishings_wall" ? <ModelList status={modal.typeOfChange} /> : null}


          <div className="btn-w">
            <button className="modal-btn" onClick={() => handlerClick(serverEvent, data)}>
              Сохранить изменения
            </button>
            <button className="modal-btn btn-reset" onClick={() => resetModal()}>
              Отмена
            </button>
          </div>
        </div>
      </div>


    );
  }
};


const mapStateToProps = (state) => {
  const { modal, activeObject } = state.main;

  return {
    modal: modal,
    activeObject: activeObject
  };
};
function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    ...actions,
  }, dispatch);
}
export default compose(connect(mapStateToProps, mapDispatchToProps))(
  ModalWindow
);
