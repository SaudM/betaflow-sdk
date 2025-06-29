/*!
 * BetaFlow SDK v0.1.1
 * Build: 2025-06-29T09:55:58.708Z
 * (c) 2025 BetaFlow
 * Released under the MIT License
 */
(function(window) {
  'use strict';

  // BetaFlow SDK 主类
  class BetaFlow {
    constructor(config) {
      // 验证必需参数
      if (!config.campaignId) {
        throw new Error('campaignId is required');
      }
      if (!config.apiKey) {
        throw new Error('apiKey is required');
      }
      
      this.config = {
        campaignId: config.campaignId,
        apiKey: config.apiKey,
        apiEndpoint: config.apiEndpoint || window.location.origin + '/api',
        language: config.language || 'zh-CN',
        theme: config.theme || 'light',
        position: config.position || 'bottom-right',
        debug: config.debug || false,
        ...config
      };
      
      this.init();
    }

    init() {
      this.createStyles();
      if (this.config.autoShow !== false) {
        this.createFloatingButton();
      }
      this.bindEvents();
      this.log('BetaFlow SDK 初始化完成');
    }

    log(message, data = null) {
      if (this.config.debug) {
        console.log('[BetaFlow SDK]', message, data);
      }
    }

    createStyles() {
      const style = document.createElement('style');
      style.textContent = `
        .betaflow-container {
          position: fixed;
          z-index: 10000;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }
        .betaflow-button {
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
          color: white;
          border: none;
          border-radius: 50px;
          padding: 12px 20px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,123,255,0.3);
          transition: all 0.3s ease;
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;
        }
        .betaflow-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,123,255,0.4);
          background: linear-gradient(135deg, #0056b3 0%, #004085 100%);
        }
        .betaflow-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10001;
          backdrop-filter: blur(4px);
        }
        .betaflow-form {
          background: white;
          padding: 30px;
          border-radius: 12px;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          animation: betaflow-fadeIn 0.3s ease;
        }
        @keyframes betaflow-fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .betaflow-form h2 {
          margin: 0 0 20px 0;
          color: #333;
          font-size: 24px;
          font-weight: 600;
        }
        .betaflow-form label {
          display: block;
          margin-bottom: 5px;
          color: #555;
          font-weight: 500;
        }
        .betaflow-form input,
        .betaflow-form textarea {
          width: 100%;
          padding: 12px;
          margin-bottom: 15px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.3s ease;
          box-sizing: border-box;
        }
        .betaflow-form input:focus,
        .betaflow-form textarea:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 3px rgba(0,123,255,0.1);
        }
        .betaflow-form .button-group {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }
        .betaflow-form button {
          flex: 1;
          padding: 12px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        .betaflow-form .submit-btn {
          background: #007bff;
          color: white;
        }
        .betaflow-form .submit-btn:hover {
          background: #0056b3;
        }
        .betaflow-form .submit-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        .betaflow-form .cancel-btn {
          background: #6c757d;
          color: white;
        }
        .betaflow-form .cancel-btn:hover {
          background: #545b62;
        }
        .betaflow-loading {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid #ffffff;
          border-radius: 50%;
          border-top-color: transparent;
          animation: betaflow-spin 1s ease-in-out infinite;
        }
        @keyframes betaflow-spin {
          to { transform: rotate(360deg); }
        }
        .betaflow-success {
          text-align: center;
          padding: 40px 20px;
        }
        .betaflow-success .icon {
          font-size: 48px;
          color: #28a745;
          margin-bottom: 20px;
        }
        .betaflow-error {
          color: #dc3545;
          font-size: 14px;
          margin-top: 10px;
        }
      `;
      document.head.appendChild(style);
    }

    createFloatingButton() {
      const container = document.createElement('div');
      container.className = 'betaflow-container';
      container.style.cssText = this.getPositionStyles();
      
      const button = document.createElement('button');
      button.className = 'betaflow-button';
      button.textContent = this.config.buttonText || '申请 Beta 测试';
      button.onclick = () => this.showApplicationForm();
      
      container.appendChild(button);
      document.body.appendChild(container);
      
      this.floatingButton = container;
    }

    getPositionStyles() {
      const positions = {
        'bottom-right': 'bottom: 20px; right: 20px;',
        'bottom-left': 'bottom: 20px; left: 20px;',
        'top-right': 'top: 20px; right: 20px;',
        'top-left': 'top: 20px; left: 20px;',
        'bottom-center': 'bottom: 20px; left: 50%; transform: translateX(-50%);'
      };
      return positions[this.config.position] || positions['bottom-right'];
    }

    showApplicationForm() {
      this.log('显示申请表单');
      
      const modal = document.createElement('div');
      modal.className = 'betaflow-modal';
      modal.innerHTML = `
        <div class="betaflow-form">
          <h2>${this.config.formTitle || '申请 Beta 测试'}</h2>
          <form id="betaflow-application-form">
            <div>
              <label>姓名 *</label>
              <input type="text" name="name" required placeholder="请输入您的姓名">
            </div>
            <div>
              <label>邮箱 *</label>
              <input type="email" name="email" required placeholder="请输入您的邮箱地址">
            </div>
            <div>
              <label>公司/组织</label>
              <input type="text" name="company" placeholder="请输入您的公司或组织名称">
            </div>
            <div>
              <label>职位</label>
              <input type="text" name="position" placeholder="请输入您的职位">
            </div>
            <div>
              <label>申请理由</label>
              <textarea name="reason" rows="3" placeholder="请简要说明您申请 Beta 测试的理由"></textarea>
            </div>
            <div class="button-group">
              <button type="submit" class="submit-btn">
                <span class="btn-text">提交申请</span>
                <span class="betaflow-loading" style="display: none;"></span>
              </button>
              <button type="button" class="cancel-btn" onclick="this.closest('.betaflow-modal').remove()">取消</button>
            </div>
            <div class="betaflow-error" style="display: none;"></div>
          </form>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // 绑定表单提交事件
      const form = modal.querySelector('#betaflow-application-form');
      form.onsubmit = (e) => this.handleFormSubmit(e, modal);
      
      // 触发回调
      if (this.config.onFormShow) {
        this.config.onFormShow();
      }
    }

    async handleFormSubmit(event, modal) {
      event.preventDefault();
      
      const form = event.target;
      const submitBtn = form.querySelector('.submit-btn');
      const btnText = submitBtn.querySelector('.btn-text');
      const loading = submitBtn.querySelector('.betaflow-loading');
      const errorDiv = form.querySelector('.betaflow-error');
      
      // 显示加载状态
      submitBtn.disabled = true;
      btnText.style.display = 'none';
      loading.style.display = 'inline-block';
      errorDiv.style.display = 'none';
      
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      
      this.log('提交表单数据', data);
      
      // 触发提交回调
      if (this.config.onFormSubmit) {
        this.config.onFormSubmit(data);
      }
      
      try {
        const response = await fetch(`${this.config.apiEndpoint}/applications`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
          },
          body: JSON.stringify({
            ...data,
            tenantId: this.config.tenantId,
            campaignId: this.config.campaignId,
            source: 'sdk',
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
          this.log('申请提交成功', result);
          this.showSuccessMessage(modal);
          
          // 触发成功回调
          if (this.config.onFormSuccess) {
            this.config.onFormSuccess(result);
          }
        } else {
          throw new Error(result.error || '提交失败');
        }
      } catch (error) {
        this.log('申请提交失败', error);
        
        // 显示错误信息
        errorDiv.textContent = error.message || '提交失败，请稍后重试';
        errorDiv.style.display = 'block';
        
        // 恢复按钮状态
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        loading.style.display = 'none';
        
        // 触发错误回调
        if (this.config.onFormError) {
          this.config.onFormError(error);
        }
      }
    }

    showSuccessMessage(modal) {
      const form = modal.querySelector('.betaflow-form');
      form.innerHTML = `
        <div class="betaflow-success">
          <div class="icon">✓</div>
          <h2>申请提交成功！</h2>
          <p>感谢您的申请，我们会尽快审核并与您联系。</p>
          <div class="button-group">
            <button type="button" class="submit-btn" onclick="this.closest('.betaflow-modal').remove()">确定</button>
          </div>
        </div>
      `;
      
      // 3秒后自动关闭
      setTimeout(() => {
        if (modal.parentNode) {
          modal.remove();
        }
      }, 3000);
    }

    async checkUserStatus(email) {
      this.log('检查用户状态', { email });
      
      try {
        const response = await fetch(`${this.config.apiEndpoint}/applications/status?email=${encodeURIComponent(email)}&campaignId=${this.config.campaignId}`, {
          headers: {
            ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
          }
        });
        
        const result = await response.json();
        this.log('用户状态查询结果', result);
        
        return result;
      } catch (error) {
        this.log('用户状态查询失败', error);
        return { error: 'Failed to check status' };
      }
    }

    async testConnection() {
      this.log('测试API连接');
      
      try {
        const response = await fetch(`${this.config.apiEndpoint}/campaigns/${this.config.campaignId}`, {
          headers: {
            ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
          }
        });
        
        const result = await response.json();
        this.log('API连接测试结果', result);
        
        return {
          success: response.ok,
          status: response.status,
          data: result
        };
      } catch (error) {
        this.log('API连接测试失败', error);
        return {
          success: false,
          error: error.message
        };
      }
    }

    getStatus() {
      return {
        initialized: true,
        config: this.config,
        hasFloatingButton: !!this.floatingButton
      };
    }

    getConfig() {
      return { ...this.config };
    }

    destroy() {
      if (this.floatingButton) {
        this.floatingButton.remove();
      }
      
      // 移除所有模态框
      const modals = document.querySelectorAll('.betaflow-modal');
      modals.forEach(modal => modal.remove());
      
      this.log('SDK 已销毁');
    }

    bindEvents() {
      // 点击模态框背景关闭
      document.addEventListener('click', (e) => {
        if (e.target.classList.contains('betaflow-modal')) {
          e.target.remove();
        }
      });
      
      // ESC 键关闭模态框
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          const modal = document.querySelector('.betaflow-modal');
          if (modal) {
            modal.remove();
          }
        }
      });
    }
  }

  // 自动初始化（如果设置了 data-auto-init）
  function autoInit() {
    const script = document.querySelector('script[src*="betaflow"]');
    if (script && script.dataset.autoInit === 'true') {
      const config = {
        tenantId: script.dataset.tenantId,
        campaignId: script.dataset.campaignId,
        apiKey: script.dataset.apiKey,
        debug: script.dataset.debug === 'true'
      };
      
      if (config.tenantId && config.campaignId) {
        window.betaflowInstance = new BetaFlow(config);
      }
    }
  }

  // 导出到全局
  window.BetaFlow = BetaFlow;
  
  // DOM 加载完成后自动初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }

})(window);