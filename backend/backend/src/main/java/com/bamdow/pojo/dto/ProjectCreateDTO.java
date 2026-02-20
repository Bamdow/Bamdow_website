package com.bamdow.pojo.dto;

import lombok.Data;

import java.util.List;

@Data
public class ProjectCreateDTO {
    private String title;
    private String description;
    private String image; // 兼容单张图片URL
    private List<String> images; // 支持多张图片URL列表
    private String category;
    private String tags;

    // 摄影项目特有字段
    private String thoughts;
    private String additionalInfo;

    // 开发项目特有字段
    private String githubUrl;

    // 其他项目特有字段
    private String externalLink;
}