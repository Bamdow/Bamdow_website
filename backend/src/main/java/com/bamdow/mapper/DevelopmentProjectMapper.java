package com.bamdow.mapper;

import com.bamdow.pojo.entity.DevelopmentProject;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface DevelopmentProjectMapper {
    /**
     * 插入开发项目表
     * @param developmentProject 开发项目实体
     */
    void insert(DevelopmentProject developmentProject);

    /**
     * 根据id查询开发项目表
     * @param id
     */
    @Select("select * from development_projects where id = #{id}")
    DevelopmentProject getById(String id);

    /**
     * 更新开发项目
     * @param developmentProject
     */
    void update(DevelopmentProject developmentProject);
}