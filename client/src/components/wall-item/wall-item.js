import React from "react";
import { connect } from "react-redux";
import { compose } from "../../utils";
import { bindActionCreators } from "redux";
import * as actions from "../../actions";

import "./wall-item.css"

import editImg from "../../img/icons/edit.png";

const insideWallInd = 4; // внутренняя сторона
const outsideWallInd = 5;  // внешняя сторона

const WallItem = ({ texture, activeObject, activeInList, dispatchSelectWall, dispatchSelectTypeOfChange }) => {

    let activeWallId = activeInList.wall.id || activeObject.wall.id;

    let indexWall = activeObject.wall.id || activeInList.wall.sideInd

    const handler = (el, sideInd) => {

        if (el.id !== activeWallId) {
            dispatchSelectWall(el.id, sideInd);
            dispatchSelectTypeOfChange('change_texture')

        } else {
            dispatchSelectTypeOfChange('change_texture')
        }
    }


    return (
        <div
            className={texture.id === activeWallId && indexWall === insideWallInd ? "list-item active-t2" : "list-item"}
        >
        <div className="item-desc">
                <div onClick={() => handler(texture, insideWallInd)}>
                    {texture.type}
                </div>
                <div onClick={() => handler(texture, insideWallInd)}>
                    {texture.name}
                </div>
        </div>
         

            <div
                className="list-item-img"
                onClick={() => handler(texture, insideWallInd)}
            >
                <img src={editImg} alt="Logo" />
            </div>
        </div>
    )
}
const mapStateToProps = (state) => {
    const { project_1, changingModels, currentWall, textureList, activeObject, activeInList } = state.main
    return {
        project_1, activeInList,
        changingModels,
        currentWall,
        textureList,
        activeObject
    };
};
function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        ...actions,
    }, dispatch);
}

export default compose(connect(mapStateToProps, mapDispatchToProps))(
    WallItem
);
