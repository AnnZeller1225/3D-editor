import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { compose } from "../../utils";
import "./modal-confirm.css";
// import { confirmModal } from "../../actions";
import * as actions from "../../actions"
import io from 'socket.io-client'
const socket = io('http://localhost:7000')

const ModalConfirm = ({ modalForConfirm, confirmModal, activeObject }) => {
  const handler = (status) => {

    if(status){
      socket.emit('deleteModel', {model: activeObject.deleting, status: status});
    } else {
      confirmModal(status);
    }

  }
  return (
    <div className={(modalForConfirm.isOpen) ? "phone-confirm" : "hide"}>
      <div className="confirm-w">
        <p>Вы уверены, что хотите удалить элемент?</p>
        <div className="confirm-btns">
          <button className="modal-item" onClick={() => handler(true)}>
            Да
          </button>
          <button className="modal-item" onClick={() => handler(false)}>
            Нет
          </button>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return { modalForConfirm: state.main.modalForConfirm,
  activeObject: state.main.activeObject };

};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    ...actions,
  }, dispatch);
}

// export default ModalForConfirm
export default compose(connect(mapStateToProps, mapDispatchToProps))(
  ModalConfirm
);
