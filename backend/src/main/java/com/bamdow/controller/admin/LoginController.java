package com.bamdow.controller.admin;


import ai.djl.modality.cv.Image;
import cn.dev33.satoken.stp.StpUtil;
import cn.smartjavaai.common.cv.SmartImageFactory;
import com.bamdow.pojo.dto.AdministratorLoginDTO;
import com.bamdow.pojo.entity.Administrator;
import com.bamdow.pojo.result.Result;
import com.bamdow.service.AdministratorService;
import com.bamdow.utils.SmartJavaAiUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Slf4j
@RestController
@RequestMapping("/login")
public class LoginController {

    @Autowired
    private AdministratorService administratorService;

    @Autowired
    private SmartJavaAiUtil smartJavaAiUtil;

    /**
     * 管理员登录
     * @param administratorLoginDTO
     * @return
     */
    @PostMapping
    public Result doLogin(@RequestPart("dto") AdministratorLoginDTO administratorLoginDTO,
                          @RequestPart("faceImage") MultipartFile faceImage) throws IOException {
        log.info("administratorLogin:{}", administratorLoginDTO);
        Administrator administrator = administratorService.login(administratorLoginDTO);
        Image image = SmartImageFactory.getInstance().fromInputStream(faceImage.getInputStream());
        smartJavaAiUtil.testLivenessDetect(image);
        smartJavaAiUtil.faceRecognition(image);
        log.info("administratorLogin:{}", administratorLoginDTO);
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
