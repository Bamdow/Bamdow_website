package com.bamdow.service;

import com.bamdow.pojo.dto.AdministratorLoginDTO;
import com.bamdow.pojo.entity.Administrator;

public interface AdministratorService {

    /**
     * 管理员账号密码登录
     * @param administratorLoginDTO
     * @return
     */
    Administrator login(AdministratorLoginDTO administratorLoginDTO);
}
