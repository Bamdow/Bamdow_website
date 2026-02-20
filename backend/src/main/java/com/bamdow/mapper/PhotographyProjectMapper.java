package com.bamdow.mapper;

import com.bamdow.pojo.entity.PhotographyProject;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface PhotographyProjectMapper {
    /**
     * 插入摄影项目表
     * @param photographyProject 摄影项目实体
     */
    void insert(PhotographyProject photographyProject);
}