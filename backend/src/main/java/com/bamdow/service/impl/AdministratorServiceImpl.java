package com.bamdow.service.impl;

import com.bamdow.constant.MessageConstant;
import com.bamdow.except.AccountNotFoundException;
import com.bamdow.except.PasswordErrorException;
import com.bamdow.mapper.AdministratorMapper;
import com.bamdow.pojo.dto.AdministratorLoginDTO;
import com.bamdow.pojo.entity.Administrator;
import com.bamdow.service.AdministratorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;

import javax.security.auth.login.AccountLockedException;

@Service
public class AdministratorServiceImpl implements AdministratorService {

    @Autowired
    private AdministratorMapper administratorMapper;


    @Override
    public Administrator login(AdministratorLoginDTO administratorLoginDTO) {
            String administratorname=administratorLoginDTO.getAdministratorname();
            String password=administratorLoginDTO.getPassword();
            //1、根据用户名查询数据库中的数据
            Administrator administrator=administratorMapper.getByAdname(administratorname);

        //2、处理各种异常情况（用户名不存在、密码不对、账号被锁定）
        if (administrator == null) {
            //账号不存在
            throw new AccountNotFoundException(MessageConstant.ACCOUNT_NOT_FOUND);
        }

        //密码比对
        // 对前端传来的密码做md5加密处理
        password = DigestUtils.md5DigestAsHex(password.getBytes());
        if (!password.equals(administrator.getPassword())) {
            //密码错误
            throw new PasswordErrorException(MessageConstant.PASSWORD_ERROR);
        }
        return administrator;
    }
}
