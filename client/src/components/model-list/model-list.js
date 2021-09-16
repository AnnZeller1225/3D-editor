import React, { useState } from "react";
import { connect } from "react-redux";
import { compose } from "../../utils";

import { bindActionCreators } from "redux";
import * as actions from "../../actions";
import "./model-list.css";


const ModelList = ({ modelList, furnishingsWallList, selectReplaceBy, status, dispatchSetNewModel, dispatchAddFurnishings }) => {

    const [select, setSelect] = useState(null);
    const handlerClick = (el, func) => {
        setSelect(el.id);
        func(el)
    }
    if (status === 'replace') {
        return (
            <div className="texture-block">
                <ul>
                    {modelList.map((el, ind) => (
                        <li key={ind}
                            className={el.id === select ? 'active' : ''}
                            onClick={() => { handlerClick(el, selectReplaceBy) }}

                        >{el.name}</li>
                    ))}
                </ul>
            </div>
        )
    } else if (status === 'add_model') {
        return (
            <div className="texture-block">
                <ul>
                    {modelList.map((el, ind) => (

                        <li key={ind}
                            className={el.id === select ? 'active' : ''}
                            onClick={() => { handlerClick(el, dispatchSetNewModel) }}
                        >{el.name}</li>
                    ))}
                </ul>
            </div>
        )
    } else if (status === 'add_furnishings_wall') {
        return (
            <div className="texture-block">
                <ul>
                    {furnishingsWallList.map((el, ind) => (

                        <li key={ind}
                            className={el.id === select ? 'active' : ''}
                            onClick={() => { handlerClick(el, dispatchAddFurnishings) }}
                        >{el.name}</li>
                    ))}
                </ul>
            </div>
        )
    }

}

const mapStateToProps = (state) => {
    const { modelList, furnishingsWallList } = state.main;
    return {
        modelList,
        furnishingsWallList
    };
};
function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        ...actions,
    }, dispatch);
}


export default compose(connect(mapStateToProps, mapDispatchToProps))(
    ModelList
);
