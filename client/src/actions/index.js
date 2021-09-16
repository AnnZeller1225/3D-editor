export const dispatchChangePositionModel = (model) => {
  return {
    type: "CHANGE_POSITION_MODEL",
    payload: model,
  };
};

export const dispatchSelectModel = (model, from) => {
  return {
    type: "SELECT_MODEL",
    payload: model,
    from: from
  };
};
export const dispatchResetSelectedModel = (model) => {
  return {
    type: "RESET_SELECTED_MODEL",
    payload: model,
  };
};
export const selectReplaceBy = (model) => {
  return {
    type: "SELECT_REPLACED_BY",
    payload: model,
  };
};

export const dispatchSelectTypeOfChange = (typeStatus, el) => {
  return {
    type: "SELECT_TYPE_OF_CHANGE",
    payload: typeStatus,
    el:el
  };
};

export const dispatchChangeVisibilityModel = (model) => {
  return {
    type: "CHANGE_VISIBILITY_MODEL",
    payload: model
  };
};


export const dispatchAddModel = (model) => {
  return {
    type: "ADD_MODEL",
    payload: model
  };
};
export const dispatchSetNewModel = (model) => {
  return {
    type: "SET_NEW_MODEL",
    payload: model
  };
};
export const changeStatusCamera = (status) => {
  return {
    type: "MOVE_CAMERA",
    payload: status
  };
};
export const dispatchSelectWall = (wall, sideIndex) => {
  return {
    type: "SELECT_WALL",
    payload: wall,
    index: sideIndex
  };
};
export const selectTexture = (id) => {
  return {
    type: "SELECT_TEXTURE",
    payload: id
  };
};
export const dispatchSelectSurface = (id) => {
  return {
    type: "SELECT_SURFACE",
    payload: id
  };
};

export const resetModal = () => {
  return {
    type: "RESET_MODAL"
  };
};

export const saveChanges = () => {
  return {
    type: "SAVE_CHANGES"
  };
};
export const dispatchSelectActionModel = (payload) => {
  return {
    type: "SELECT_ACTION_MODEL",
    payload: payload
  };
};
export const dispatchResetNewModel = (payload) => {
  return {
    type: "RESET_NEW_MODEL",
    payload: payload
  };
};
export const dispatchReplaceModel = (payload) => {
  return {
    type: "REPLACE_MODEL",
    payload: payload
  };
};
// возможно она лишняя и можно упростить - уже есть addModel в навигации
export const dispatchAddFurnishings = (payload) => {
  return {
    type: "ADD_FURNISHINGS",
    payload: payload
  };
};

export const confirmModal = (payload) => {
  return {
    type: "CONFIRM_MODAL",
    payload: payload
  };
};
export const dispatchLocModel = (payload) => {
  return {
    type: "LOCK_MODEL",
    payload: payload
  };
};
export const dispatchResetLockModel = () => {
  return {
    type: "RESET_LOCK_MODEL",
  };
};

export const selectedInModelList = (payload) => {
  return {
    type: "SELECTED_IN_MODELLIST",
    payload: payload,
  };
};

export const dispatchPercentLoad = (payload) => {
  return {
    type: "PERCENT_LOAD",
    payload: payload,
  };
};
export const dispatchPercentReset = (payload) => {
  return {
    type: "PERCENT_RESET",
    payload: payload,
  };
};

