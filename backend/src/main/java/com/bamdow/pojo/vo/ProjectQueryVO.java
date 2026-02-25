package com.bamdow.pojo.vo;

import lombok.Data;

@Data
public class ProjectQueryVO {
    private String id;
    private String title;
    private String description;
    private String image;
    private String category;
    private String tags; // 数据库原始字符串（逗号分隔）
}
