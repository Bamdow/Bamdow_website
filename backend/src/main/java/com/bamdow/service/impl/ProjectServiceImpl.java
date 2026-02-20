package com.bamdow.service.impl;

import com.bamdow.mapper.DevelopmentProjectMapper;
import com.bamdow.mapper.OtherProjectMapper;
import com.bamdow.mapper.PhotographyProjectMapper;
import com.bamdow.mapper.ProjectMapper;
import com.bamdow.pojo.dto.PageQuery;
import com.bamdow.pojo.dto.ProjectCreateDTO;
import com.bamdow.pojo.entity.DevelopmentProject;
import com.bamdow.pojo.entity.OtherProject;
import com.bamdow.pojo.entity.PhotographyProject;
import com.bamdow.pojo.entity.Project;
import com.bamdow.pojo.result.PageResult;
import com.bamdow.pojo.vo.ProjectDetailVO;
import com.bamdow.pojo.vo.ProjectListVO;
import com.bamdow.service.ProjectService;
import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Slf4j
@Service
public class ProjectServiceImpl implements ProjectService {

    @Autowired
    private ProjectMapper projectMapper;

    @Autowired
    private PhotographyProjectMapper photographyProjectMapper;

    @Autowired
    private DevelopmentProjectMapper developmentProjectMapper;

    @Autowired
    private OtherProjectMapper otherProjectMapper;

    @Transactional
    @Override
    public void save(ProjectCreateDTO projectCreateDTO) {
        // 生成UUID
        String id = UUID.randomUUID().toString();

        // 保存到主表
        Project project = new Project();
        BeanUtils.copyProperties(projectCreateDTO, project);
        project.setId(id);

        // 处理图片URL：如果有多张图片，将其转换为逗号分隔的字符串
        if (projectCreateDTO.getImages() != null && !projectCreateDTO.getImages().isEmpty()) {
            String imageUrls = String.join(",", projectCreateDTO.getImages());
            project.setImage(imageUrls);
        }

        projectMapper.insert(project);

        // 根据分类保存到对应子表
        String category = projectCreateDTO.getCategory();
        if ("Photography".equals(category)) {
            PhotographyProject photographyProject = new PhotographyProject();
            photographyProject.setId(id);
            photographyProject.setThoughts(projectCreateDTO.getThoughts());
            photographyProject.setAdditionalInfo(projectCreateDTO.getAdditionalInfo());
            photographyProjectMapper.insert(photographyProject);
        } else if ("Development".equals(category)) {
            DevelopmentProject developmentProject = new DevelopmentProject();
            developmentProject.setId(id);
            developmentProject.setGithubUrl(projectCreateDTO.getGithubUrl());
            developmentProjectMapper.insert(developmentProject);
        } else if ("Other".equals(category)) {
            OtherProject otherProject = new OtherProject();
            otherProject.setId(id);
            otherProject.setExternalLink(projectCreateDTO.getExternalLink());
            otherProjectMapper.insert(otherProject);
        }

        log.info("保存项目成功，ID: {}", id);
    }

    @Override
    public PageResult pageQuery(PageQuery pageQuery) {
        PageHelper.startPage(pageQuery.getPage(), pageQuery.getSize());
        Page<ProjectListVO> page=projectMapper.pageQuery(pageQuery);
        return new PageResult(page.getTotal(),page.getResult());
    }
}