package com.bamdow.mapper;

import com.bamdow.pojo.entity.DevelopmentProject;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface DevelopmentProjectMapper {
    /**
     * 插入开发项目表
     * @param developmentProject 开发项目实体
     */
    void insert(DevelopmentProject developmentProject);
}