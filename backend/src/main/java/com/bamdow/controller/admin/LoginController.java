package com.bamdow.controller.admin;


import cn.dev33.satoken.stp.StpUtil;
import com.bamdow.pojo.dto.AdministratorLoginDTO;
import com.bamdow.pojo.entity.Administrator;
import com.bamdow.pojo.result.Result;
import com.bamdow.service.AdministratorService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/login")
public class LoginController {

    @Autowired
    private AdministratorService administratorService;

    /**
     * 管理员登录
     * @param administratorLoginDTO
     * @return
     */
    @PostMapping
    public Result doLogin(@RequestBody AdministratorLoginDTO administratorLoginDTO) {
        log.info("administratorLogin:{}", administratorLoginDTO);
        Administrator administrator = administratorService.login(administratorLoginDTO);
        // 使用 sa-token 进行登录，存储管理员ID
        boolean rememberMe = administratorLoginDTO.getRememberMe() != null && administratorLoginDTO.getRememberMe();
        StpUtil.login(administrator.getId(),rememberMe);
        String token = StpUtil.getTokenValue();
        return Result.success(token);
    }

    /**
     * 账号登出
     * @return
     */
    @PostMapping("/logout")
    public Result logout() {
        StpUtil.logout();
        return Result.success();
    }

}
