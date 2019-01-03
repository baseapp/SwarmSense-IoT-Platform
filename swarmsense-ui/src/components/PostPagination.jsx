/**
 * This file is part of SwarmSense IoT Platform
 * Copyright (c) 2018, Baseapp Systems And Softwares Private Limited
 * Authors: Gopal Lal
 *
 * License: www.baseapp.com/swarmsense-whitelabel-iot-platoform
 */
import React from "react";
import { Pagination } from "admin-on-rest";

const PostPagination = ({ page, perPage, total, setPage }) => {
  if (window.location.hash.length <= 25) {
    page=1;
  }
  return (<Pagination page={page} perPage={perPage} total={total} setPage={setPage}/>);
}

export default PostPagination;
