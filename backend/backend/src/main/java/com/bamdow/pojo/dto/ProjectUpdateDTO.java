package com.bamdow.pojo.dto;

import lombok.Data;

@Data
public class ProjectUpdateDTO {
    private String title;
    private String description;
    private String image;
    private String tags;

    // 摄影项目特有字段
    private String thoughts;
    private String additionalInfo;

    // 开发项目特有字段
    private String githubUrl;

    // 其他项目特有字段
    private String externalLink;
}