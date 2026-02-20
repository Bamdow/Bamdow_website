package com.bamdow.service;

import com.bamdow.pojo.dto.PageQuery;
import com.bamdow.pojo.dto.ProjectCreateDTO;
import com.bamdow.pojo.result.PageResult;

public interface ProjectService {
    //新增作品
    void save(ProjectCreateDTO projectCreateDTO);

    //分页查询作品
    PageResult pageQuery(PageQuery pageQuery);
}