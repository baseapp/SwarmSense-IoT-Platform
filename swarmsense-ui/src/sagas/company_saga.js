/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
 
import { put, takeEvery } from "redux-saga/effects";
import { showNotification } from "admin-on-rest";

/**
 * A generator function to enable the side-effect of selecting
 * company.
 * @param {object} action A plain action object as required in redux
 * @yields {func} A function which takes every "SELECT_COMPANY" and generates
 * notification of selecting a company.
 */
export function* company_saga(action) {
  yield takeEvery("SELECT_COMPANY", function*(input) {
    //console.log(input, "input")
    yield put(
      showNotification(`Company changed to ${input.payload.name}`, "info")
    );
  });
}
