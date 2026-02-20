package com.bamdow.mapper;

import com.bamdow.pojo.entity.OtherProject;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface OtherProjectMapper {
    /**
     * 插入其他项目表
     * @param otherProject 其他项目实体
     */
    void insert(OtherProject otherProject);
}