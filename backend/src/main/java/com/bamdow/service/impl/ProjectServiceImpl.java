package com.bamdow.service.impl;

import com.bamdow.mapper.*;
import com.bamdow.pojo.dto.PageQuery;
import com.bamdow.pojo.dto.ProjectCreateDTO;
import com.bamdow.pojo.dto.ProjectUpdateDTO;
import com.bamdow.pojo.entity.*;
import com.bamdow.pojo.result.PageResult;
import com.bamdow.pojo.vo.ProjectDetailVO;
import com.bamdow.pojo.vo.ProjectListVO;
import com.bamdow.pojo.vo.ProjectQueryVO;
import com.bamdow.service.ProjectService;
import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

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

    @Autowired
    private ProjectImageMapper projectImageMapper;

    @Transactional
    @Override
    public void save(ProjectCreateDTO projectCreateDTO) {
        // 生成UUID
        String id = UUID.randomUUID().toString();

        // 保存到主表
        Project project = new Project();
        BeanUtils.copyProperties(projectCreateDTO, project);
        project.setId(id);

        // 处理标签：将标签数组转换为逗号分隔的字符串
        if (projectCreateDTO.getTags() != null && !projectCreateDTO.getTags().isEmpty()) {
            String tagsString = String.join(",", projectCreateDTO.getTags());
            project.setTags(tagsString);
        }

        projectMapper.insert(project);

        // 保存图片到project_images表
        if (projectCreateDTO.getImages() != null && !projectCreateDTO.getImages().isEmpty()) {
            for (int i = 0; i < projectCreateDTO.getImages().size(); i++) {
                ProjectImage projectImage = new ProjectImage();
                projectImage.setId(UUID.randomUUID().toString());
                projectImage.setProjectId(id);
                projectImage.setImageUrl(projectCreateDTO.getImages().get(i));
                projectImage.setSortOrder(i);
                projectImageMapper.insert(projectImage);
            }
        }

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
            developmentProject.setReadme(projectCreateDTO.getReadme());
            developmentProjectMapper.insert(developmentProject);
        } else if ("Other".equals(category)) {
            OtherProject otherProject = new OtherProject();
            otherProject.setId(id);
            otherProject.setExternalLink(projectCreateDTO.getExternalLink());
            otherProject.setIntroduction(projectCreateDTO.getIntroduction());
            otherProjectMapper.insert(otherProject);
        }

        log.info("保存项目成功，ID: {}", id);
    }

    @Override
    public PageResult pageQuery(PageQuery pageQuery) {
        // 1. 启动分页
        PageHelper.startPage(pageQuery.getPage(), pageQuery.getSize());
        // 2. 查询原始数据（tags是字符串）
        Page<ProjectQueryVO> queryPage = projectMapper.pageQuery(pageQuery);

        // 3. 逐个转换为前端需要的 ProjectListVO，并处理字段
        List<ProjectListVO> projectListVOs = queryPage.stream().map(queryVO -> {
            ProjectListVO vo = new ProjectListVO();
            // 复制基础字段（id/title/description/category）
            BeanUtils.copyProperties(queryVO, vo);

            // 处理双语标题
            ProjectListVO.BilingualTitle bilingualTitle = new ProjectListVO.BilingualTitle();
            bilingualTitle.setZh(queryVO.getTitle());
            bilingualTitle.setEn(queryVO.getTitle()); // 可后续替换为真实英文标题
            vo.setBilingualTitle(bilingualTitle);

            // 处理tags：字符串转List<String>
            if (queryVO.getTags() != null && !queryVO.getTags().isEmpty()) {
                vo.setTags(Arrays.asList(queryVO.getTags().split(",")));
            }

            // 查询项目图片列表
            List<ProjectImage> projectImages = projectImageMapper.getByProjectId(queryVO.getId());
            if (projectImages != null && !projectImages.isEmpty()) {
                List<String> imageUrls = projectImages.stream()
                        .map(ProjectImage::getImageUrl)
                        .collect(Collectors.toList());
                vo.setImages(imageUrls);
            }

            return vo;
        }).collect(Collectors.toList());

        // 4. 封装返回结果（直接用查询页的总条数 + 转换后的结果列表）
        return new PageResult(queryPage.getTotal(), projectListVOs);
    }

    @Override
    public ProjectDetailVO getById(String id) {
        //根据id查询作品主表数据
        Project project=projectMapper.getById(id);
        ProjectDetailVO projectDetailVO=new ProjectDetailVO();
        //将主表数据先传入VO
        BeanUtils.copyProperties(project,projectDetailVO);
        
        // 设置bilingualTitle字段
        ProjectDetailVO.BilingualTitle bilingualTitle = new ProjectDetailVO.BilingualTitle();
        bilingualTitle.setZh(project.getTitle());
        bilingualTitle.setEn(project.getTitle()); // 暂时使用相同的标题，后续可以根据需要从其他字段获取英文标题
        projectDetailVO.setBilingualTitle(bilingualTitle);
        
        // 处理tags字段：将逗号分隔的字符串转换为数组
        if (project.getTags() != null && !project.getTags().isEmpty()) {
            projectDetailVO.setTags(Arrays.asList(project.getTags().split(",")));
        }
        
        // 查询项目图片列表
        List<ProjectImage> projectImages = projectImageMapper.getByProjectId(id);
        if (projectImages != null && !projectImages.isEmpty()) {
            List<String> imageUrls = projectImages.stream()
                    .map(ProjectImage::getImageUrl)
                    .collect(Collectors.toList());
            projectDetailVO.setImages(imageUrls);
        }
        
        //根据得到的分类查询子表数据
        String category = project.getCategory();
        if ("Photography".equals(category)) {
            //根据id得到子表数据
            PhotographyProject photographyProject=photographyProjectMapper.getById(id);
            //将子表数据传入VO
            BeanUtils.copyProperties(photographyProject,projectDetailVO);
        } else if ("Development".equals(category)) {
            DevelopmentProject developmentProject=developmentProjectMapper.getById(id);
            BeanUtils.copyProperties(developmentProject,projectDetailVO);
        } else if ("Other".equals(category)) {
            OtherProject otherProject=otherProjectMapper.getById(id);
            BeanUtils.copyProperties(otherProject,projectDetailVO);
        }
        return projectDetailVO;
    }

    @Override
    public void update(ProjectUpdateDTO projectUpdateDTO) {
        //获取项目id
        String id = projectUpdateDTO.getId();
        //查询项目主表得到project存储对象
        Project project = projectMapper.getById(id);
        //将DTO类赋值给存储对象
        BeanUtils.copyProperties(projectUpdateDTO,project);
        //对修改后的project对象中tags成员进行数组->字符串转换
        if (projectUpdateDTO.getTags() != null && !projectUpdateDTO.getTags().isEmpty()) {
            String tagsString = String.join(",", projectUpdateDTO.getTags());
            project.setTags(tagsString);
        }
        projectMapper.update(project);
        
        // 更新项目图片：先删除旧图片，再添加新图片
        projectImageMapper.deleteByProjectId(id);
        List<String> imageUrls=Arrays.asList(projectUpdateDTO.getImage().split(","));
        if (imageUrls != null && !imageUrls.isEmpty()) {
            for (int i = 0; i < imageUrls.size(); i++) {
                ProjectImage projectImage = new ProjectImage();
                projectImage.setId(UUID.randomUUID().toString());
                projectImage.setProjectId(id);
                projectImage.setImageUrl(imageUrls.get(i));
                projectImage.setSortOrder(i);
                projectImageMapper.insert(projectImage);
            }
        }
        
        //更新副表数据
        String category = project.getCategory();
        if ("Photography".equals(category)) {
            PhotographyProject photographyProject=photographyProjectMapper.getById(id);
            BeanUtils.copyProperties(projectUpdateDTO,photographyProject);
            photographyProjectMapper.update(photographyProject);
        } else if ("Development".equals(category)) {
            DevelopmentProject developmentProject=developmentProjectMapper.getById(id);
            BeanUtils.copyProperties(projectUpdateDTO,developmentProject);
            developmentProjectMapper.update(developmentProject);
        } else if ("Other".equals(category)) {
            OtherProject otherProject=otherProjectMapper.getById(id);
            BeanUtils.copyProperties(projectUpdateDTO,otherProject);
            otherProjectMapper.update(otherProject);
        }
        log.info("更新项目成功ID: {}", id);
    }

    @Override
    public void deleteBatch(List<String> ids) {
        for(String id:ids){
            //拿到分类便于从副表同步删除信息
            String category=projectMapper.getById(id).getCategory();
            if ("Photography".equals(category)) {
                photographyProjectMapper.deleteById(id);
            } else if ("Development".equals(category)) {
                developmentProjectMapper.deleteById(id);
            } else if ("Other".equals(category)) {
                otherProjectMapper.deleteById(id);
            }
            projectImageMapper.deleteByProjectId(id);
            projectMapper.deleteById(id);
        }
        log.info("删除ID: {}成功", ids);
    }
}