package com.bamdow.pojo.entity;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.sql.Timestamp;

@Data
public class Administrator {
    private String id;
    private String administratorname;
    private String password;
//    private MultipartFile faceImage;
    private String featureStr;
    private String imageUrl;
    private Timestamp createdAt;
    private Timestamp updatedAt;
}
