import React, { Component, useState } from "react";
import { connect } from "react-redux";
import { compose } from "../../utils";
import {
    selectTexture
} from "../../actions";
import "./texture-list.css";
const TextureList = ({ textureList, selectTexture }) => {

    const [select, setSelect] = useState(null);
    const handlerClick = (el, func) => {
        setSelect(el.id);
        func(el.id)
    }
    return (
        <div className="texture-block">
            <ul>
                {textureList.map((el, ind) => (
                    <li
                        className={el.id === select ? 'active' : ''}
                        onClick={() => { handlerClick(el, selectTexture) }}
                        key={ind}
                    >{el.name}</li>
                ))}
            </ul>
        </div>
    )


}

class TextureListContainer extends Component {
    render() {
        const {
            textureList,
            selectTexture
        } = this.props;

        return (
            <div>
                <TextureList
                    textureList={textureList}
                    selectTexture={selectTexture}
                />
            </div>
        );
    }
}


const mapStateToProps = (state) => {
    return {
        textureList: state.main.textureList
    };
};
const mapDispatchToProps = (dispatch) => {
    return {
        selectTexture: (id) => dispatch(selectTexture(id))
    };
};

export default compose(connect(mapStateToProps, mapDispatchToProps))(
    TextureListContainer
);
