import React from "react";
import { connect } from "react-redux";
import { compose } from "../../utils";
import { bindActionCreators } from "redux";
import * as actions from "../../actions";
import "./load-bar.css";


const LoadBar = ({ percentLoading, dispatchPercentReset }) => {

  const delayDispatch = ()=> {
    setTimeout(sayHi, 1500);
  }

  function sayHi() {
    dispatchPercentReset();
  }

  if (!percentLoading) {
    return (
      <div></div>
    );
  } else if (percentLoading  === 100) {
    return (
      <div className="load-bar slow-hide" onClick={  delayDispatch()}>
        <div className="load-bar-w">Загрузка завершена {percentLoading}%!</div>
      </div >
    )

  
  } else if (percentLoading < 100) {
    return (
      <div className="load-bar slow-hide" >
        <div className="load-bar-w">loading ...{percentLoading}%</div>
      </div >
    )
  }
  //;

  // else if (percentLoading == 100) {

  //   return (
  //     <div className="load-bar slow-hide">
  //       <div className="load-bar-w">Загрузка завершена !</div>
  //     </div>
  //   );
  //   // dispatchPercentReset()
  // }

  // else {

  //   return (

  //     <div className="load-bar slow-hide">
  //       <div className="load-bar-w">loading ...{percentLoading}%</div>
  //     </div>

  //   )

  // }


};

const mapStateToProps = (state) => {
  return {
    percentLoading: state.load.percentLoading,
  };
};
function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      ...actions,
    },
    dispatch
  );
}
export default compose(connect(mapStateToProps, mapDispatchToProps))(LoadBar);
