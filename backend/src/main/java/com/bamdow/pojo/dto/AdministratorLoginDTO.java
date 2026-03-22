package com.bamdow.pojo.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class AdministratorLoginDTO {
    private String administratorname;
    private String password;
//    private MultipartFile faceImage;
    private Boolean rememberMe;
}
