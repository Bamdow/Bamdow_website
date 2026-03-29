package com.bamdow.pojo.vo;

import com.bamdow.pojo.entity.ProjectImage;
import lombok.Data;

import java.util.List;

@Data
public class ProjectQueryVO {
    private String id;
    private String title;
    private String description;
    private String category;
    private String tags; // 数据库原始字符串（逗号分隔）
    private List<String> imageUrls;
}
