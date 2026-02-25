package com.bamdow.pojo.dto;

import lombok.Data;

import java.util.List;

@Data
public class ProjectUpdateDTO {
    private String id;
    private String title;
    private String description;
    private String image;
    private List<String> tags;

    // 摄影项目特有字段
    private String thoughts;
    private String additionalInfo;

    // 开发项目特有字段
    private String githubUrl;
    private String readme;
    
    // 其他项目特有字段
    private String externalLink;
    private String introduction;
}