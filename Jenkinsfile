pipeline {
  agent any

  options {
    timestamps()
    timeout(time: 15, unit: 'MINUTES')
  }

  environment {
    // Pastikan Bun ada di PATH agent Jenkins (lihat README)
    PATH = "${env.HOME}/.bun/bin:${env.PATH}"
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Verifikasi Bun') {
      steps { sh 'bun --version' }
    }

    stage('Install Dependencies') {
      steps { sh 'bun install' }
    }

    stage('Build') {
      steps { sh 'bun run build' }
    }

    stage('Arsip Artefak') {
      steps { archiveArtifacts artifacts: 'dist/**', fingerprint: true }
    }
  }

  post {
    success { echo 'Pipeline sukses: build Front-End selesai.' }
    failure { echo 'Pipeline gagal: periksa Console Output.' }
  }
}
