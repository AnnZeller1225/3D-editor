import { connect } from "react-redux";
import React from "react";

const Navigation = ({ activeObject}) => {
  return (
    <nav className="nav">
      <div className="nav-item">Квартира</div>
      <div className="nav-item">Проект</div>
      <div className="nav-item">Флорплан</div>
      <div className="nav-item active-floorplane">{activeObject.wall?.name || activeObject.model?.name || activeObject.surface?.name || null}</div>
    </nav>
  );
};


const mapStateToProps = (state) => {
  return { activeObject: state.main.activeObject };
};


export default connect(mapStateToProps, null)(Navigation);