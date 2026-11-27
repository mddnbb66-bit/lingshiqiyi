# Three.js 官方示例 → 《搅动泥沙》可用清单 (2026-11-27, from examples/files.json on dev)
Base URL: https://threejs.org/examples/#<name>
- 第一人称移动+洞壁碰撞: games_fps (Octree+Capsule), misc_controls_pointerlock, webgl_raycaster_bvh
- 洞穴生成: webgl_geometry_extrude_splines (tube along spline), webgl_marchingcubes, webgl_volume_perlin, webgpu_tsl_procedural_terrain
- 头灯/体积光: webgl_lights_spotlight, webgpu_lights_projector, webgpu_volume_lighting, webgpu_lights_ies_spotlight, webgl_shadowmap_pointlight
- 淤泥/悬浮颗粒: webgpu_particles_soft, webgpu_compute_particles, webgpu_compute_particles_snow, webgl_buffergeometry_custom_attributes_particles
- 浑水雾: webgpu_custom_fog_scattering, webgpu_fog_height, webgpu_volume_cloud
- 水下光影(洞口段): webgpu_caustics, webgpu_volume_caustics
- 导引绳: physics_ammo_rope, webgl_lines_fat
- 面镜/生理状态后处理: webgpu_postprocessing_ca(氮醉色差), _radial_blur(恐慌), _motion_blur, _afterimage(CO2拖影), _dof(起雾/失焦), _retro(颗粒), webgl_postprocessing_glitch(断片)
- 声音: webaudio_orientation, webaudio_sandbox (PositionalAudio)
- 手/装备模型: webgl_loader_gltf, webgl_animation_skinning_ik
- 震动反馈: webxr_xr_haptics
Note: webgpu_* use WebGPURenderer (falls back to WebGL2).
